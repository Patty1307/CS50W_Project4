let currentPage = 1;

document.addEventListener('DOMContentLoaded', () => {

load_Posts()

const toastPost = document.getElementById('PostToast')
const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastPost)


// Register Click event for previous button
document.querySelector('#prev').addEventListener('click', () => {
    currentPage--;
    
    load_Posts(currentPage)
});

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
})


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
        toastBootstrap.show()

    } catch (error) {
        console.error("Error sending email", error.message);
    }

    // Close the modal 
    const modalElement = document.getElementById("composeModal");
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();

  };



// Load posts

});

async function load_Posts(page_number = 1, feed = "") {

    
    try{
        
        // Which feed should we get. All ('') or following

        const url = new URL(window.location.href);
        const feed = url.searchParams.get('feed') ?? '';
        
        //Api call for all Posts
        const response = await fetch(`/posts/all?page=${page_number}&feed=${feed}`);

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

function renderPosts(posts) {
    const container = document.querySelector('#posts')
    container.innerHTML = ''; 

    posts.forEach(post => {
        const div = document.createElement('div');
        div.className = 'card shadow-sm mt-2 hover-lift';
        div.innerHTML = `
        
            <div class="p-2 d-flex justify-content-between">
                
                <div class="flex-grow-1 min-w-0 me-3">
                    <p class="mb-1 fw-semibold">${post.owner}</p>
                    <p class="mb-1 text-break">${post.content}</p>
                    <p class="mb-0 text-muted">
                    <span>Likes ${post.likes}</span>
                    <span class="ms-2">Comments ${post.comments_count}</span>
                    </p>
                </div>

                <div class="d-flex align-items-center flex-shrink-0">
                    <p class="m-0 text-muted small">${post.created}</p>
                </div>
            </div>
        
        `
        container.appendChild(div);
        
    });

    }

function renderPageNavigation(page_obj) {

    document.querySelector("#prev").disabled = !page_obj.has_previous;
    document.querySelector("#next").disabled = !page_obj.has_next;
    document.querySelector('#PageCounter').innerHTML = page_obj.number + " of " + page_obj.num_pages
}


function getUrlParam(paramName) {
    try {
        url = window.location.href;
        
        const parsedUrl = new URL(url);

        const value = parsedUrl.searchParams.get(paramName);

        return value !== null ? value : null;
    } catch (error) {
        console.error("Non valid URL:", error);
        return null;
    }
}


