import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import JsonResponse
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_POST, require_GET
from django import forms
from django.core.paginator import Paginator

from .models import User, Post, Like, Comment


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
        "form": form
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
def all_posts(request):
    
    page_number = request.GET.get('page')

    

    post_list = Post.objects.all()
    paginator = Paginator(post_list,10) # 10 Posts per page
    
    page_obj = paginator.get_page(page_number)

    return JsonResponse({
        "posts" : [post.serialize() for post in page_obj.object_list],
        "page_obj" : {  "number": page_obj.number,
                        "num_pages" : paginator.num_pages,
                        "has_next" : page_obj.has_next(),
                        "has_previous": page_obj.has_previous()                     
                      }
        })