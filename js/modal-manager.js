const overlay = document.getElementById("overlay");
const modalButtons = document.querySelectorAll(".modal-button");
const closeModalButtons = document.querySelectorAll(".close-modal");

function stopClickPropagation(event) {
    event.stopPropagation();
}

var currentModal;
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) {
        return;
    }
    currentModal = modal;
    document.body.style.overflowY = 'hidden';
    const styles = window.getComputedStyle(document.documentElement);
    const scrollWidth = styles.getPropertyValue('--scrollbar-width');
    document.body.style.paddingRight = `${scrollWidth}`;
    overlay.style.display = "block";
    modal.style.display = "block";
    modal.addEventListener("click", stopClickPropagation);
}

function closeModal() {
    overlay.style.display = "none";
    currentModal.style.display = "none";
    document.body.style.overflowY = 'auto';
    document.body.style.paddingRight = '0';
    currentModal.removeEventListener("click", stopClickPropagation);
}

function initialize() {
    //associate modal with button
    modalButtons.forEach((button) => {
        button.addEventListener("click", function () {
            const targetModalId = this.dataset.modalTarget;
            openModal(targetModalId);
        });
    });

    //add event listeners to close modals
    closeModalButtons.forEach((button) => {
        button.addEventListener("click", closeModal);
    });

    overlay.addEventListener("click", function (event) {
        closeModal();
    });
}

initialize();