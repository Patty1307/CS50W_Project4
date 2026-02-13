let currentPage = 1;

document.addEventListener('DOMContentLoaded', () => {

// initialize to load Posts
load_Posts()

// Register Click event for previous button
document.querySelector('#prev').addEventListener('click', () => {
    currentPage--;
    
    load_Posts(currentPage)
});

// Register Click event for next button
document.querySelector('#next').addEventListener('click', () => {
    currentPage++;
        
    load_Posts(currentPage)
});


// When the modal hides reset the form each time
const PostModal = document.getElementById('composeModal')
PostModal.addEventListener('hidden.bs.modal', event => {
    // reset form
    const form = document.querySelector('#compose-form');
    form.reset();
});


// Save the Content of the Post with API Call
document.querySelector('#compose-form').onsubmit = async (event) => {
    
    // Prevent normal submit
    event.preventDefault();

    try{
        // Get the Data from the Form
        const content = document.querySelector('#post-content').value;
        
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;

        // API-CALL
        const response = await fetch('/posts', {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify({
                content
            })
        });

        // Json parsen
        const data = await response.json();
        
        // Check Http status if everything is okay. Else Error handling
        if (!response.ok) {
            throw new Error(data.error || "Unknown error while posting");
        }
        console.log("Post API response:", data);

        await load_Posts()
        showToast("Post successfully uploaded!");

    } catch (error) {
        console.error("Error sending email", error.message);
        showToast("Error while uploading post!")
    }

    // Close the modal 
    const modalElement = document.getElementById("composeModal");
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();

  };
});

// Function to load the posts
async function load_Posts(page_number = 1) {
    
    try{
        
        const api_call = window.location.pathname == "/" ?  "" : window.location.pathname
        
       
        //Api call for all Posts
        const response = await fetch(`/posts/get${api_call}?page=${page_number}`);

        // Json parsen
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Unkown error while loading posts");
        }
        console.log("Post API response", data);
    
        renderPosts(data.posts)
        renderPageNavigation(data.page_obj)
    
    } catch (error) {
        console.error("Error loading posts", error.message);
    }

}

// Function that renders the Post containers
function renderPosts(posts) {
    const container = document.querySelector('#posts')
    container.innerHTML = ''; 

    posts.forEach(post => {
        const div = document.createElement('div');
        div.className = 'card shadow-sm mt-2 hover-lift';
        div.innerHTML = `
            <div class="p-2 d-flex justify-content-between">
                <div class="flex-grow-1 min-w-0 me-3">
                    <a href="${post.owner_url}">
                        <p class="mb-1 fw-semibold">${post.owner}</p>
                    </a> 
                    <p class="mb-1 text-break">${post.content}</p>
                    <p class="mb-0 text-muted">
                      
                        <button class="btn p-0 border-0 bg-transparent like-btn">
                            <i class="bi ${post.liked_by_me ? "bi-heart-fill text-danger" : "bi-heart"} heart-icon"></i>
                        </button>
                        <span class="like-count">${post.likes}</span>
                       
                    </p>
                </div>
                <div class="d-flex align-items-center flex-shrink-0">
                    <p class="m-0 text-muted small">${post.created}</p>
                </div>
            </div>
        `
        
            const likeBtn = div.querySelector(".like-btn");
            const heartIcon = div.querySelector(".heart-icon");
            const likeCount = div.querySelector(".like-count");
            // Event listener for the Like button
            likeBtn.addEventListener("click", () => {
                toggleLike(post, heartIcon, likeCount);
            });




        container.appendChild(div);
        
    });

    }

// Renders the Page navigation
function renderPageNavigation(page_obj) {

    document.querySelector("#prev").disabled = !page_obj.has_previous;
    document.querySelector("#next").disabled = !page_obj.has_next;
    document.querySelector('#PageCounter').innerHTML = page_obj.number + " of " + page_obj.num_pages;
}


// Click event for the like Button
async function toggleLike(post, heartIcon, likeCount) {

    try{
        
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]').value;


        // API-CALL
        const response = await fetch(`/posts/${post.id}/${post.liked_by_me ? "unlike" : "like"}`, {
            method: `${post.liked_by_me ? "DELETE" : "POST"}`,
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            }
        });

        // Json parsen
        const data = await response.json();
        
        // Check Http status if everything is okay. Else Error handling
        if (!response.ok) {
            throw new Error(data.error || "Unknown error while posting");
        }
        console.log("Like API response:", data);


        post.liked_by_me = !post.liked_by_me;

        if (post.liked_by_me) {
            heartIcon.classList.remove("bi-heart");
            heartIcon.classList.add("bi-heart-fill", "text-danger");
            likeCount.textContent = parseInt(likeCount.textContent) + 1;
        } else {
            heartIcon.classList.remove("bi-heart-fill", "text-danger");
            heartIcon.classList.add("bi-heart");
            likeCount.textContent = parseInt(likeCount.textContent) - 1;
        }

    } catch (error) {
        console.error("Error loading posts", error.message);
    }
}
