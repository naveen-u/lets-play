"""
This module contains some utility functions and decorators.
"""

import functools

from flask_login import current_user


def is_admin(func):
    """
    Decorator that ensures the method is called only by the room admin.

    Args:
        func (function): Function being decorated

    Returns:
        function: Decorated function which calls the original function
        if the user is the room admin, and returns otherwise
    """

    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        if current_user.admin_of is None:
            return None
        return func(*args, **kwargs)

    return wrapper
