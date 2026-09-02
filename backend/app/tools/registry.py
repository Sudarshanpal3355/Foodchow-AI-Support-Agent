from google.genai import types

from backend.app.tools.order_tools import lookup_order
from backend.app.tools.payment_tools import lookup_payment
from backend.app.tools.refund_tools import lookup_refund
from backend.app.tools.restaurant_tools import lookup_restaurant
from backend.app.tools.outlet_tools import lookup_outlet

from backend.app.tools.menu_tools import (
    lookup_menu,
    lookup_outlet_menu,
)

from backend.app.tools.printer_tools import (
    lookup_printer,
    lookup_outlet_printer,
)

from backend.app.tools.kds_tools import (
    lookup_kds,
    lookup_outlet_kds,
)

from backend.app.tools.account_tools import (
    lookup_account,
    lookup_restaurant_account,
)

from backend.app.tools.support_tools import (
    create_ticket,
    lookup_ticket,
)


# =========================================================
# TOOL FUNCTIONS
# =========================================================

TOOL_FUNCTIONS = {
    "lookup_order": lookup_order,
    "lookup_payment": lookup_payment,
    "lookup_refund": lookup_refund,

    "lookup_restaurant": lookup_restaurant,
    "lookup_outlet": lookup_outlet,

    "lookup_menu": lookup_menu,
    "lookup_outlet_menu": lookup_outlet_menu,

    "lookup_printer": lookup_printer,
    "lookup_outlet_printer": lookup_outlet_printer,

    "lookup_kds": lookup_kds,
    "lookup_outlet_kds": lookup_outlet_kds,

    "lookup_account": lookup_account,
    "lookup_restaurant_account": lookup_restaurant_account,

    "create_ticket": create_ticket,
    "lookup_ticket": lookup_ticket,
}


# =========================================================
# ORDER TOOL
# =========================================================

ORDER_TOOL_DECLARATION = types.FunctionDeclaration(
    name="lookup_order",
    description=(
        "Look up a FoodChow order by its order ID. "
        "Use this when the customer asks about a specific order, "
        "including its status, payment status, items, or total amount."
    ),
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "order_id": types.Schema(
                type="STRING",
                description="The FoodChow order ID, for example ORD1002.",
            ),
        },
        required=["order_id"],
    ),
)


# =========================================================
# PAYMENT TOOL
# =========================================================

PAYMENT_TOOL_DECLARATION = types.FunctionDeclaration(
    name="lookup_payment",
    description=(
        "Look up payment information for a FoodChow order. "
        "Use this when the customer asks about payment status, "
        "payment method, amount, transaction ID, or a payment problem."
    ),
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "order_id": types.Schema(
                type="STRING",
                description="The FoodChow order ID, for example ORD1002.",
            ),
        },
        required=["order_id"],
    ),
)


# =========================================================
# REFUND TOOL
# =========================================================

REFUND_TOOL_DECLARATION = types.FunctionDeclaration(
    name="lookup_refund",
    description=(
        "Look up refund information for a FoodChow order. "
        "Use this when the customer asks about a refund, "
        "refund status, refund amount, or whether a refund exists."
    ),
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "order_id": types.Schema(
                type="STRING",
                description="The FoodChow order ID, for example ORD1002.",
            ),
        },
        required=["order_id"],
    ),
)


# =========================================================
# RESTAURANT TOOL
# =========================================================

RESTAURANT_TOOL_DECLARATION = types.FunctionDeclaration(
    name="lookup_restaurant",
    description=(
        "Look up FoodChow restaurant information using a restaurant ID. "
        "Use this when the customer asks about a restaurant, "
        "including its name, status, cuisine, or city."
    ),
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "restaurant_id": types.Schema(
                type="STRING",
                description="The FoodChow restaurant ID, for example REST001.",
            ),
        },
        required=["restaurant_id"],
    ),
)


# =========================================================
# OUTLET TOOL
# =========================================================

OUTLET_TOOL_DECLARATION = types.FunctionDeclaration(
    name="lookup_outlet",
    description=(
        "Look up FoodChow outlet information using an outlet ID. "
        "Use this when the customer asks about an outlet, "
        "including its name, address, restaurant, or status."
    ),
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "outlet_id": types.Schema(
                type="STRING",
                description="The FoodChow outlet ID, for example OUT001.",
            ),
        },
        required=["outlet_id"],
    ),
)


# =========================================================
# MENU TOOL
# =========================================================

MENU_TOOL_DECLARATION = types.FunctionDeclaration(
    name="lookup_menu",
    description=(
        "Look up FoodChow menu information using a menu ID. "
        "Use this when the customer asks about a specific menu, "
        "including its name, status, version, restaurant, or outlet."
    ),
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "menu_id": types.Schema(
                type="STRING",
                description="The FoodChow menu ID, for example MENU001.",
            ),
        },
        required=["menu_id"],
    ),
)


# =========================================================
# OUTLET MENU TOOL
# =========================================================

OUTLET_MENU_TOOL_DECLARATION = types.FunctionDeclaration(
    name="lookup_outlet_menu",
    description=(
        "Look up the menu associated with a FoodChow outlet. "
        "Use this when the customer asks which menu is assigned "
        "to a specific outlet."
    ),
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "outlet_id": types.Schema(
                type="STRING",
                description="The FoodChow outlet ID, for example OUT001.",
            ),
        },
        required=["outlet_id"],
    ),
)


# =========================================================
# PRINTER TOOL
# =========================================================

PRINTER_TOOL_DECLARATION = types.FunctionDeclaration(
    name="lookup_printer",
    description=(
        "Look up FoodChow printer information using a printer ID. "
        "Use this when the customer asks about printer status, "
        "paper status, connection status, or last successful print."
    ),
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "printer_id": types.Schema(
                type="STRING",
                description="The FoodChow printer ID, for example PRN001.",
            ),
        },
        required=["printer_id"],
    ),
)


# =========================================================
# OUTLET PRINTER TOOL
# =========================================================

OUTLET_PRINTER_TOOL_DECLARATION = types.FunctionDeclaration(
    name="lookup_outlet_printer",
    description=(
        "Look up the printer associated with a FoodChow outlet. "
        "Use this when the customer asks about the printer "
        "for a specific outlet."
    ),
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "outlet_id": types.Schema(
                type="STRING",
                description="The FoodChow outlet ID, for example OUT001.",
            ),
        },
        required=["outlet_id"],
    ),
)


# =========================================================
# KDS TOOL
# =========================================================

KDS_TOOL_DECLARATION = types.FunctionDeclaration(
    name="lookup_kds",
    description=(
        "Look up FoodChow KDS information using a KDS ID. "
        "Use this when the customer asks about KDS status, "
        "connection status, pending orders, or last order received."
    ),
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "kds_id": types.Schema(
                type="STRING",
                description="The FoodChow KDS ID, for example KDS001.",
            ),
        },
        required=["kds_id"],
    ),
)


# =========================================================
# OUTLET KDS TOOL
# =========================================================

OUTLET_KDS_TOOL_DECLARATION = types.FunctionDeclaration(
    name="lookup_outlet_kds",
    description=(
        "Look up the KDS associated with a FoodChow outlet. "
        "Use this when the customer asks about the kitchen display "
        "system for a specific outlet."
    ),
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "outlet_id": types.Schema(
                type="STRING",
                description="The FoodChow outlet ID, for example OUT001.",
            ),
        },
        required=["outlet_id"],
    ),
)


# =========================================================
# ACCOUNT TOOL
# =========================================================

ACCOUNT_TOOL_DECLARATION = types.FunctionDeclaration(
    name="lookup_account",
    description=(
        "Look up FoodChow account information using an account ID. "
        "Use this when the customer asks about account status, "
        "role, security status, or account access. "
        "Never retrieve, expose, or invent passwords."
    ),
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "account_id": types.Schema(
                type="STRING",
                description="The FoodChow account ID, for example ACC001.",
            ),
        },
        required=["account_id"],
    ),
)


# =========================================================
# RESTAURANT ACCOUNT TOOL
# =========================================================

RESTAURANT_ACCOUNT_TOOL_DECLARATION = types.FunctionDeclaration(
    name="lookup_restaurant_account",
    description=(
        "Look up the account associated with a FoodChow restaurant. "
        "Use this when the customer asks about the account "
        "associated with a specific restaurant."
    ),
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "restaurant_id": types.Schema(
                type="STRING",
                description="The FoodChow restaurant ID, for example REST001.",
            ),
        },
        required=["restaurant_id"],
    ),
)


# =========================================================
# CREATE TICKET TOOL
# =========================================================

CREATE_TICKET_TOOL_DECLARATION = types.FunctionDeclaration(
    name="create_ticket",
    description=(
        "Create a FoodChow support ticket when an issue requires "
        "human support or escalation. Use this only when a support "
        "ticket needs to be created."
    ),
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "issue": types.Schema(
                type="STRING",
                description="A concise description of the customer's issue.",
            ),
            "priority": types.Schema(
                type="STRING",
                description=(
                    "Ticket priority such as low, medium, high, or urgent."
                ),
            ),
            "customer_id": types.Schema(
                type="STRING",
                description="The FoodChow customer ID, for example CUS002.",
            ),
            "order_id": types.Schema(
                type="STRING",
                description=(
                    "Optional FoodChow order ID related to the issue, "
                    "for example ORD1002."
                ),
            ),
        },
        required=["issue", "priority"],
    ),
)


# =========================================================
# LOOKUP TICKET TOOL
# =========================================================

LOOKUP_TICKET_TOOL_DECLARATION = types.FunctionDeclaration(
    name="lookup_ticket",
    description=(
        "Look up a FoodChow support ticket using its ticket ID. "
        "Use this when the customer asks about a support ticket "
        "or its current status."
    ),
    parameters=types.Schema(
        type="OBJECT",
        properties={
            "ticket_id": types.Schema(
                type="STRING",
                description=(
                    "The FoodChow support ticket ID, for example "
                    "TKT-EBA5B902."
                ),
            ),
        },
        required=["ticket_id"],
    ),
)


# =========================================================
# ALL TOOL DECLARATIONS
# =========================================================

TOOL_DECLARATIONS = [
    types.Tool(
        function_declarations=[
            ORDER_TOOL_DECLARATION,
            PAYMENT_TOOL_DECLARATION,
            REFUND_TOOL_DECLARATION,
            RESTAURANT_TOOL_DECLARATION,
            OUTLET_TOOL_DECLARATION,
            MENU_TOOL_DECLARATION,
            OUTLET_MENU_TOOL_DECLARATION,
            PRINTER_TOOL_DECLARATION,
            OUTLET_PRINTER_TOOL_DECLARATION,
            KDS_TOOL_DECLARATION,
            OUTLET_KDS_TOOL_DECLARATION,
            ACCOUNT_TOOL_DECLARATION,
            RESTAURANT_ACCOUNT_TOOL_DECLARATION,
            CREATE_TICKET_TOOL_DECLARATION,
            LOOKUP_TICKET_TOOL_DECLARATION,
        ]
    )
]