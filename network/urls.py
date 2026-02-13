
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("profile/<int:profile_id>", views.profile, name="profile"),
    path("following", views.following, name="following"),


    # API Routes
    path("posts", views.compose, name="compose"),
    path("posts/get", views.get_posts, name="get_posts"),
    path("posts/get/following", views.get_posts_following, name="get_posts_follwing"),
    path("posts/get/profile/<int:profile_id>", views.get_posts_by_profile, name="get_posts_by_profile"),
    path("posts/<int:post_id>/like", views.like, name="like"),
    path("posts/<int:post_id>/unlike", views.unlike, name="unlike")
]
