import requests
from jose import jwt
from rest_framework import authentication, exceptions
from django.conf import settings
from users.utils import get_or_create_user_from_clerk

class ClerkAuthentication(authentication.BaseAuthentication):
    """
    Authenticate requests using Clerk JWT.
    """

    def authenticate(self, request):
        auth_header = request.headers.get("Authorization")

        if not auth_header or not auth_header.startswith("Bearer "):
            return None  # No token = request is not authenticated

        token = auth_header.split(" ")[1]

        try:
            # Fetch JWKS keys from Clerk
            jwks_url = f"https://{settings.CLERK_DOMAIN}/.well-known/jwks.json"
            jwks = requests.get(jwks_url).json()

            # Validate JWT
            payload = jwt.decode(
                token,
                jwks,
                algorithms=["RS256"],
                options={"verify_aud": False}
            )

        except Exception as e:
            raise exceptions.AuthenticationFailed(f"Invalid Clerk token: {str(e)}")

        clerk_id = payload.get("sub")
        email = payload.get("email_addresses", [{}])[0].get("email_address", "")
        first_name = payload.get("first_name", "")
        last_name = payload.get("last_name", "")
        image_url = payload.get("image_url", "")

        if not clerk_id:
            raise exceptions.AuthenticationFailed("No Clerk ID found in token")

        user = get_or_create_user_from_clerk(
            clerk_id,
            email,
            first_name,
            last_name,
            image_url
        )

        return (user, None)
