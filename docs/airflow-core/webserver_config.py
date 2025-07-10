from flask_appbuilder.security.manager import AUTH_OAUTH
from airflow.www.security import AirflowSecurityManager

AUTH_TYPE = AUTH_OAUTH
AUTH_ROLE_ADMIN = 'Admin'
AUTH_USER_REGISTRATION = True
AUTH_USER_REGISTRATION_ROLE = "Viewer"

OAUTH_PROVIDERS = [
    {
        'name': 'auth0',
        'token_key': 'access_token',
        'icon': 'fa-circle',
        'remote_app': {
            'client_id': 'wUzgSsPGxVXW2g9rDKG9UUmYRRh7Oo6P',
            'client_secret': 'KR0PC4KVrDjFMxf9gX9PePJ6nbWTvmB79bsC3esCoS8rwZHntMTYqPlvzPV4NICO',
            'client_kwargs': {'scope': 'openid profile email'},
            'server_metadata_url': 'https://dev-f5ge1-8v.us.auth0.com/.well-known/openid-configuration',
        }
    }
]

class CustomSecurityManager(AirflowSecurityManager):
    def auth_user_oauth(self, userinfo):
        import logging
        logging.warning(f"[Auth0] userinfo: {userinfo}")

        email = userinfo.get("email")
        if not email:
            logging.error("Missing 'email' in Auth0 response")
            return None

        username = userinfo.get("username")
        role_name = "Admin" if email == "kalpak44@ya.ru" else AUTH_USER_REGISTRATION_ROLE

        # Check if user already exists
        user = self.find_user(username=username)
        if user:
            logging.warning(f"[Auth0] Found existing user: {user}")
            return user

        first_name = userinfo.get("first_name")
        last_name = userinfo.get("last_name")

        # Otherwise create the user
        logging.warning(f"[Auth0] Creating new user with role: {role_name}")
        role = self.find_role(role_name)
        user = self.add_user(
            username=username,
            first_name=first_name,
            last_name=last_name,
            email=email,
            role=role,
        )
        return user

SECURITY_MANAGER_CLASS = CustomSecurityManager