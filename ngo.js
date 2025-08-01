// Sample donations data
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const logoutBtn = document.getElementById('logout-btn');
    const donationFilter = document.getElementById('donation-filter');
    const donationList = document.getElementById('ngo-donation-list');
    
    if (!currentUser || currentUser.user.role !== 'ngo') {
        window.location.href = 'login.html';
        return;
    }
    
    // Load donations
async function renderDonations(filter = 'all') {
    donationList.innerHTML = '';
    let options = { method: "GET" };
    let response = await fetch('/api/ngo-donations', options);
    let allDonations = await response.json();
    if (!allDonations || allDonations.length === 0) {
        donationList.innerHTML = '<p>No donations found</p>';
        return;
    }
        let filteredDonations = allDonations;
          
        filteredDonations.forEach(
            user_donations => {
                let filteredDonation=user_donations.donations;
                                filteredDonation.forEach(donation => {
                        const donationCard = document.createElement('div');
                        donationCard.className = 'donation-card';
                        donationCard.innerHTML = `
                            <h3>${donation.item}</h3>
                            <div class="donation-meta">
                                <span>Donor: ${donation.donorName}</span>
                                <span>Category: ${donation.category}</span>
                                <span>Quantity: ${donation.quantity}</span>
                                <span>Date: ${donation.date}</span>
                            </div>
                            <div class="status status-${donation.status}">${donation.status}</div>
                            ${donation.status !== 'collected' ? 
                                `<button class="action-btn" data-id="${donation.id}">
                                    ${donation.status === 'pending' ? 'Approve' : 'Mark as Collected'}
                                </button>` : ''
                            }
                        `;
                        donationList.appendChild(donationCard);
                    });
            });
        
        // Add event listeners to action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const donationId = parseInt(this.getAttribute('data-id'));
                updateDonationStatus(donationId);
            });
        });
    }
    
    // Update donation status
    function updateDonationStatus(id) {
        const donation = allDonations.find(d => d.id === id);
        if (!donation) return;
        
        if (donation.status === 'pending') {
            donation.status = 'approved';
        } else if (donation.status === 'approved') {
            donation.status = 'collected';
        }
        
        renderDonations(donationFilter.value);
    }
    
    // Initial render
    renderDonations();
    
    // Filter change
    donationFilter.addEventListener('change', function() {
        renderDonations(this.value);
    });
    
    // Logout
    logoutBtn.addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'login.html';
    });
});