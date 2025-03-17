document.addEventListener('DOMContentLoaded', function () {
  // Get all the elements we need
  const joinBtn = document.getElementById('login-modal-joinBtn');
  const modalContainer = document.getElementById('login-modal-container');
  const backdrop = document.getElementById('login-modal-backdrop');
  const closeBtn = document.getElementById('login-modal-closeBtn');
  const loginBtn = document.getElementById('login-modal-login');
  const registerBtn = document.getElementById('login-modal-register');

  // Function to open the modal
  function openModal() {
      modalContainer.style.display = 'block';
      backdrop.style.display = 'block';
  }

  // Function to close the modal
  function closeModal() {
      modalContainer.style.display = 'none';
      backdrop.style.display = 'none';
  }

  // Show modal when clicking Join Us (for all join buttons)
  const joinButtons = document.querySelectorAll('.login-modal-join-btn');
  joinButtons.forEach(button => {
      button.addEventListener('click', openModal);
  });

  // Close modal with close button
  if (closeBtn) {
      closeBtn.addEventListener('click', closeModal);
  }

  // Close modal when clicking backdrop
  if (backdrop) {
      backdrop.addEventListener('click', closeModal);
  }

  // Toggle between sign in and sign up
  if (loginBtn) {
      loginBtn.addEventListener('click', () => {
          modalContainer.classList.remove('login-modal-active');
      });
  }

  if (registerBtn) {
      registerBtn.addEventListener('click', () => {
          modalContainer.classList.add('login-modal-active');
      });
  }
});