const submissionForm = document.getElementById('submission-form');
const submissionResponse = document.getElementById('submission-response');
const submitButton = document.getElementById('submit-button');

const API_ENDPOINT = 'https://email-proxy-73057111242.europe-west1.run.app';

submissionForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    submitButton.disabled = true;
    submissionResponse.textContent = '';
    submissionResponse.classList.remove('success', 'error');

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const subject = document.getElementById('subject').value.trim();
    const content = document.getElementById('content').value.trim();

    const params = new URLSearchParams({
        name: name,
        subject: subject
    });

    const urlWithParams = `${API_ENDPOINT}?${params.toString()}`;

    const plainTextBody = `Email: ${email}\n\nMessage: ${content}`;

    try {
        const response = await fetch(urlWithParams, {
            method: 'POST',
            headers: {
                'Content-Type': 'text/plain',
            },
            body: plainTextBody,
        });

        const responseText = await response.text();

        if (response.ok) {
            submissionResponse.textContent = responseText || 'Your message has been sent successfully!';
            submissionResponse.classList.add('success');
            submissionForm.reset();
        } else {
            submissionResponse.textContent = responseText || 'An error occurred. Please try again.';
            submissionResponse.classList.add('error');
        }
    } catch (error) {
        console.error('Fetch error:', error);
        submissionResponse.textContent = 'Network error. Please check your connection and try again.';
        submissionResponse.classList.add('error');
    } finally {
        submissionForm.remove();
    }
});