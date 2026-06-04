import re
from django.core.exceptions import ValidationError
from django.utils.translation import gettext as _

class ComplexPasswordValidator:
    def validate(self, password, user=None):

        if not re.search(r'[0-9]', password):
            raise ValidationError(
                _("Password mein kam az kam aik number (0-9) hona lazmi hai."),
                code='password_no_number',
            )

        if not re.search(r'[!@#$%^&*(),.?":{}|<>+=-]', password):
            raise ValidationError(
                _("Password mein kam az kam aik special character (!@#$%^&*) hona lazmi hai."),
                code='password_no_symbol',
            )

    def get_help_text(self):
        return _(
            "Aapka password kam az kam 8 characters ka hona chahiye aur usmein aik number aur aik special character hona lazmi hai."
        )