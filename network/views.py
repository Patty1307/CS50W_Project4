import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, get_object_or_404
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_POST, require_GET, require_http_methods
from django import forms
from django.core.paginator import Paginator

from .models import User, Post, Like, Comment, Following


class PostForm(forms.ModelForm):
    class Meta:
        model = Post
        fields = ["content"]
        labels= { 
            "content": "Your Post"
        }
        widgets = {
            "content": forms.Textarea(attrs={"class": "form-control", "rows": 4, "id": "post-content"})
        }


def index(request):
    
    form = PostForm()

    return render(request, "network/index.html", {
        "form": form,
    })


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")

@require_POST
@login_required
@csrf_protect
def compose(request):
    
    # Composing a new post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    content = data.get("content","")
    if not content:
        return JsonResponse({"error": "Content must not be empty."}, status=400)
    owner = request.user

    post = Post(
        owner=owner,
        content=content.strip()
    )
    post.save()

    return JsonResponse({"message": "Post successfully"}, status=201)

@require_GET
def get_posts(request):
    
    page_number = request.GET.get('page')  

    post_list = Post.objects.all()
    paginator = Paginator(post_list,10) # 10 Posts per page
    
    page_obj = paginator.get_page(page_number)

    return JsonResponse({
        "posts" : [post.serialize(request.user) for post in page_obj.object_list],
        "page_obj" : {  "number": page_obj.number,
                        "num_pages" : paginator.num_pages,
                        "has_next" : page_obj.has_next(),
                        "has_previous": page_obj.has_previous()                     
                      }
        })

@require_GET
def get_posts_by_profile(request, profile_id):
    page_number = request.GET.get('page')  

    post_list = Post.objects.filter(owner=profile_id)
    paginator = Paginator(post_list,10) # 10 Posts per page
    
    page_obj = paginator.get_page(page_number)

    return JsonResponse({
        "posts" : [post.serialize(request.user) for post in page_obj.object_list],
        "page_obj" : {  "number": page_obj.number,
                        "num_pages" : paginator.num_pages,
                        "has_next" : page_obj.has_next(),
                        "has_previous": page_obj.has_previous()                     
                      }
        })

@csrf_protect
@require_POST
@login_required
def like(request, post_id):

    post = get_object_or_404(Post, id=post_id)

    like, created = Like.objects.get_or_create(
        user=request.user,
        post=post
    )

    return JsonResponse({
        "liked": True,
        "created": created,
        "likes_count": post.likes.count()
    }, status=200)


@csrf_protect
@require_http_methods(["DELETE"])
@login_required
def unlike(request, post_id):


    post = get_object_or_404(Post, id=post_id)

    deleted, _ = Like.objects.filter(
        user=request.user,
        post=post
    ).delete()

    return JsonResponse({
        "liked": False,
        "deleted": deleted > 0,
        "likes_count": post.likes.count()
    }, status=200)


@require_GET
def profile(request, profile_id):
    
    profile = get_object_or_404(User, id=profile_id)
    
    is_following = (
        request.user.is_authenticated and
        profile.followers.filter(user=request.user).exists()
    )

    return render(request, "network/profile.html",{
        "profile_name": profile.username,
        "profile_followers_count": profile.followers.count(),
        "profile_followed_count": profile.following.count(),
        "can_follow_or_unfollow": profile.id != request.user.id,
        "is_following": is_following
    })

@csrf_protect
@login_required
@require_POST
def follow(request,profile_id):
    
    profile = get_object_or_404(User, id=profile_id)

    if profile.id == request.user.id:
        return JsonResponse({"error": "You cannot follow yourself."}, status=400)

    relation, created = Following.objects.get_or_create(
        user=request.user,
        followed=profile
    )

    return JsonResponse({
        "Followed": True,
        "created": created,
        "follow_count": profile.followers.count()
    }, status=200)


@csrf_protect
@require_http_methods(["DELETE"])
@login_required
def unfollow(request,profile_id):
    
    profile = get_object_or_404(User, id=profile_id)

    deleted, _ = Following.objects.filter(
        user=request.user,
        followed=profile
    ).delete()

    return JsonResponse({
        "liked": False,
        "deleted": deleted > 0,
        "follow_count": profile.followers.count()
    }, status=200)



@require_GET
@login_required
def following(request):
    return render(request, "network/index.html")


@require_GET
@login_required
def get_posts_following(request):

    page_number = request.GET.get('page')  

    post_list = Post.objects.filter(owner__followers__user=request.user)
    paginator = Paginator(post_list,10) # 10 Posts per page
    
    page_obj = paginator.get_page(page_number)

    return JsonResponse({
        "posts" : [post.serialize(request.user) for post in page_obj.object_list],
        "page_obj" : {  "number": page_obj.number,
                        "num_pages" : paginator.num_pages,
                        "has_next" : page_obj.has_next(),
                        "has_previous": page_obj.has_previous()                     
                      }
        })

@csrf_protect
@require_http_methods(["PUT"])
@login_required
def update_post(request, post_id):
    post = get_object_or_404(Post, id=post_id)

    # Only owner can edit
    if post.owner != request.user:
        return JsonResponse({"error": "Not allowed"}, status=403)

    data = json.loads(request.body)
    new_content = data.get("content", "").strip()

    if not new_content:
        return JsonResponse({"error": "Content empty"}, status=400)

    post.content = new_content
    post.save()

    return JsonResponse({
        "success": True,
        "content": post.content,
        "edited": post.edited.strftime("%d.%m.%Y %H:%M")
    })