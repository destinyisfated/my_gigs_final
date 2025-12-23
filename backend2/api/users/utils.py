from django.contrib.auth.models import User
from .models import ClerkProfile
from mygigs.models import Freelancer

def get_or_create_user_from_clerk(clerk_id, email, first_name="", last_name="", image_url=None, role="user"):
    """
    Get or create a Django user and ClerkProfile from a Clerk JWT payload.
    Ensures role and profile_image are always synced.
    """
    try:
        profile = ClerkProfile.objects.get(clerk_id=clerk_id)
        # Update role or image if changed
        updated = False
        if profile.role != role:
            profile.role = role
            updated = True
        if profile.profile_image != image_url:
            profile.profile_image = image_url
            updated = True
        if updated:
            profile.save()
        return profile.user

    except ClerkProfile.DoesNotExist:
        pass

    # Create new Django user
    username = f"user_{clerk_id}"
    user = User.objects.create(
        username=username,
        first_name=first_name or "",
        last_name=last_name or "",
        email=email or "",
    )

    # Create ClerkProfile with role
    ClerkProfile.objects.create(
        user=user,
        clerk_id=clerk_id,
        profile_image=image_url,
        role=role
    )

    return user

def get_or_create_freelancer(user):
    """
    Returns the Freelancer profile for this user.
    If it does not exist, create one automatically.
    """
    freelancer, created = Freelancer.objects.get_or_create(user=user)
    return freelancer
