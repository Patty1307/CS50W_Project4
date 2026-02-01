document.addEventListener('DOMContentLoaded', () => {

// When the modal hides reset the form each time
const PostModal = document.getElementById('composeModal')
PostModal.addEventListener('hidden.bs.modal', event => {
    // reset form
    const form = document.querySelector('#compose-form');
    form.reset();
})


// Save the Content of the Post with API Call
document.querySelector('#compose-form').addEventListener('submit', (event) => {
    
    // Prevent normal submit
    event.preventDefault();

    // Get the Data from the Form
    const content = document.querySelector('#post-content').value;
    console.log("Post-Content:", content);


    // Close the modal 
    const modalElement = document.getElementById("composeModal");
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();

  });

});