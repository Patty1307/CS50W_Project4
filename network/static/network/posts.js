let currentPage = 1;

document.addEventListener('DOMContentLoaded', () => {

// initial load
loadPosts(1);

  // Pagination buttons
  document.querySelector("#prev").addEventListener("click", () => {
    if (currentPage > 1) loadPosts(currentPage - 1);
  });


document.querySelector("#next").addEventListener("click", () => {
    loadPosts(currentPage + 1);
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

    } catch (error) {
        console.error("Error sending email", error.message);
    }

    // Close the modal 
    const modalElement = document.getElementById("composeModal");
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();

  };


});

async function loadPosts(page) {
  try {
    const response = await fetch(`/posts/all?page=${page}`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    console.log("All Posts API:", data);

    currentPage = data.page;

    renderPosts(data.posts);

    document.querySelector("#prev").disabled = !data.has_previous;
    document.querySelector("#next").disabled = !data.has_next;
    document.querySelector("#PageCounter").innerHTML= "Page " + currentPage + " of " + data.num_pages;

  } catch (err) {
    console.error("Failed to load posts:", err);
  }
}

function renderPosts(posts) {
  const container = document.querySelector("#posts");
  container.innerHTML = "";

  posts.forEach(post => {
    container.appendChild(renderPost(post));
  });
}

function renderPost(post) {
  const card = document.createElement("div");
  card.className = "border rounded p-2 mb-2";

  card.innerHTML = `
    <div class="d-flex justify-content-between align-items-center">
      <strong>${escapeHtml(post.owner)}</strong>
      <small class="text-muted">${formatDate(post.created)}</small>
    </div>
    <p class="mb-0 mt-2">${escapeHtml(post.can_edit)}</p>
    <p class="mb-0 mt-2">${escapeHtml(post.content)}</p>
    <p class="mb-0 mt-2">${escapeHtml(post.likes)}</p>
  `;

  return card;
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;"
  }[m]));
}

function formatDate(isoString) {
  return isoString ? isoString.slice(0, 16).replace("T", " ") : "";
}