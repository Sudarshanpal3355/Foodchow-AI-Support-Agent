import json

from backend.app.tools.registry import TOOL_FUNCTIONS


def execute_tool(tool_name: str, arguments: dict) -> str:
    """
    Execute a registered FoodChow tool and return
    the result as a JSON string.
    """

    function = TOOL_FUNCTIONS.get(tool_name)

    if function is None:
        return json.dumps({
            "success": False,
            "error": f"Unknown tool: {tool_name}",
        })

    try:
        result = function(**arguments)

        return json.dumps(
            result,
            default=str,
        )

    except Exception as exc:
        return json.dumps({
            "success": False,
            "error": str(exc),
        })