document.addEventListener('DOMContentLoaded', function () {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const logoutBtn = document.getElementById('logout-btn');
  const donationList = document.getElementById('donor-donation-list');
  const donationModal = document.getElementById('donation-modal');
  const closeModalBtn = document.getElementById('close-modal');
  const donationForm = document.getElementById('donation-form');
  const newDonationBtn = document.getElementById('new-donation');

  async function loadDonations() {
    try {
      const response = await fetch('/api/get-donations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: currentUser.user.email, role: currentUser.user.role})
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message);

      const donated_items = result.user || [];


      if (donated_items.length == 0) {
        let paragraph = document.createElement('p');
        paragraph.textContent = 'No donations found.';
        donationList.appendChild(paragraph);  
      }

      donated_items.forEach(donation => {
        const donationCard = document.createElement('div');
        donationCard.className = 'donation-card';
        donationCard.innerHTML = `
          <h3>${donation.item}</h3>
          <div class="donation-meta">
            <span>Category: ${donation.category}</span>
            <span>Quantity: ${donation.quantity}</span>
            <span>Date: ${donation.date}</span>
          </div>
        `;
        donationList.appendChild(donationCard);
      });

    } catch (err) {
      alert('Error loading donations: ' + err.message);
    }
  }
  // ✅ New Donation Button
  newDonationBtn.addEventListener('click', function () {
    window.location.href = '/form.html';
  });

  // ✅ Logout
  logoutBtn.addEventListener('click', function () {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
  });

  // ✅ Load donations on page load
  loadDonations();
});
