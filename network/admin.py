from django.contrib import admin

from .models import Post, Like, Comment, User, Following

class PostAdmin(admin.ModelAdmin):
    list_display = ("id", "owner", "content", "created", "edited")

class CommentAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "post", "content")


# Register your models here.
admin.site.register(Post, PostAdmin)
admin.site.register(User)
admin.site.register(Comment, CommentAdmin)
admin.site.register(Like)
admin.site.register(Following)