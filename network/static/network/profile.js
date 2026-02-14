const apiUrl = window.location.pathname.replace(/\/$/, "");

document.addEventListener('DOMContentLoaded', () => {

const btn = document.querySelector("#followbtn");

let following = btn.dataset.following === "true";

   // Save the Content of the Post with API Call
document.querySelector('#follow-form').onsubmit = async (event) => {
    
    // Prevent normal submit
    event.preventDefault();
    const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]')?.value;
    const endpoint = following ? "unfollow" : "follow";
    try{
      
        // API-CALL
        const response = await fetch(`${apiUrl}/${endpoint}`, {
            method: following ? "DELETE" : "POST",
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
        });

        // Json parsen
        const data = await response.json();
        
        // Check Http status if everything is okay. Else Error handling
        if (!response.ok) {
            throw new Error(data.error || "Unknown error Following/Unfollowinng");
        }
        console.log("Post API response:", data);
        following = !following;
        btn.dataset.following = following ? "true" : "false";
        btn.innerHTML = following ? "Unfollow" : "Follow";
        document.querySelector("#Followers").innerHTML = data.follow_count

    } catch (error) {
        console.error("Error Following/Unfollowing", error.message);
        showToast("Error Following/Unfollowinng")
    }

  };
});







    






