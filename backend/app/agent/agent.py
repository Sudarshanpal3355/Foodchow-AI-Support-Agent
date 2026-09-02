import json

from google import genai
from google.genai import types

from backend.app.agent.tool_runner import execute_tool
from backend.app.core.config import settings
from backend.app.llm.prompts import SYSTEM_PROMPT
from backend.app.tools.registry import TOOL_DECLARATIONS


client = genai.Client(
    api_key=settings.GEMINI_API_KEY
)


def run_agent(user_message: str) -> str:
    """
    Run the FoodChow AI support agent.

    Gemini can decide whether it needs to call
    one of the registered FoodChow tools.
    """

    response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=user_message,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
            tools=TOOL_DECLARATIONS,
        ),
    )

    # Check whether Gemini requested a function call.
    function_calls = response.function_calls

    if not function_calls:
        return response.text

    # Execute the requested tool calls.
    tool_results = []

    for function_call in function_calls:
        tool_name = function_call.name
        arguments = dict(function_call.args or {})

        result = execute_tool(
            tool_name,
            arguments,
        )

        tool_results.append(
            types.Part.from_function_response(
                name=tool_name,
                response=json.loads(result),
            )
        )

    # Send tool results back to Gemini.
    final_response = client.models.generate_content(
        model=settings.GEMINI_MODEL,
        contents=[
            user_message,
            response.candidates[0].content,
            types.Content(
                role="user",
                parts=tool_results,
            ),
        ],
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT,
        ),
    )

    return final_response.text