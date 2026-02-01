document.addEventListener('DOMContentLoaded', () => {

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