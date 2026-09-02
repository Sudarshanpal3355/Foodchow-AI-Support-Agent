from typing import Final


SAFE_ACTIONS: Final = {
    "get_restaurant",
    "get_outlet",
    "get_order",
    "get_order_status",
    "get_payment_status",
    "get_printer_status",
    "get_kds_status",
    "get_menu_status",
    "create_support_ticket",
}

SENSITIVE_ACTIONS: Final = {
    "refund",
    "account_security",
    "account_deletion",
    "configuration_change",
}


def is_safe_action(action: str) -> bool:
    return action in SAFE_ACTIONS


def is_sensitive_action(action: str) -> bool:
    return action in SENSITIVE_ACTIONS