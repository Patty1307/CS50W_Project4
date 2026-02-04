from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass


class Post(models.Model):
    content = models.TextField()
    owner = models.ForeignKey('User', on_delete=models.CASCADE, related_name='posts')
    created = models.DateTimeField(auto_now_add=True)
    edited = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created']


    def __str__(self):
        return self.content[:50]
    
    # The Json we send with the API Call to Load all the necessary Data in the frontend
    def serialize(self, user=None):
        return{
            # Base Data
            "id": self.id,
            "owner": self.owner.username,
            "content": self.content,
            "created": self.created.isoformat(),
            "edited": self.edited.isoformat() if self.edited else None,

            # Likes
            "likes": self.likes.count(),
            "liked_by_me": (
                self.likes.filter(user=user).exists()
                if user and user.is_authenticated
                else False
            ),

            # Edit rights on the Post
            "can_edit": user == self.owner if user else False,

            # Amount of comments
            "comments_count": self.comments.count()

        }
    


class Like(models.Model):
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey('Post', on_delete=models.CASCADE, related_name="likes")
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'post')

class Comment(models.Model):
    content = models.TextField()
    user = models.ForeignKey('User', on_delete=models.CASCADE, related_name='comments')
    post = models.ForeignKey('Post', on_delete=models.CASCADE, related_name="comments")
    created = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created']

    def __str__(self):
        return self.content[:50]
