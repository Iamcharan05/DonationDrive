// --- REGISTRATION PAGE LOGIC ---
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    // These elements only exist on the register page, so we look for them here
    const ngo_role = document.getElementById("ngo-role");
    const donor_role = document.getElementById("donor-role");
    const security_code_field = document.querySelector(".form-group.hidden");

    if (ngo_role && donor_role && security_code_field) {
        ngo_role.addEventListener("click", function(event) {
            security_code_field.classList.remove("hidden");
        });
        donor_role.addEventListener("click", function(event) {
            security_code_field.classList.add("hidden");
        });
    }

    // Event listener for form submission
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault(); // Stop page from reloading
        let role="donor";
        const first_name = document.getElementById('register-first-name').value;
        const last_name = document.getElementById('register-last-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        role = document.querySelector('input[name="user-role"]:checked')?.value;
        if (!role) {
            alert('Please select a role.');
            return;
        }
        try {

            if (role === 'ngo') 
                   {
                        // If the user is an NGO, we need to check for the security code
                        const security_code = document.getElementById('security-code').value;
                        if (!security_code) 
                        {
                            alert('Please enter the security code for NGO registration.');
                            return;
                        }
                        else 
                        {
                            if (security_code !== 'ngo123') 
                            {
                                alert('Invalid security code. Please try again.');
                                return;
                            }
                            else
                            {
                                const response = await fetch('/api/register', {
                                        method: "POST",
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ first_name, last_name, email, password, role })
                                    });

                                    const result = await response.json();

                                    if (!response.ok) {
                                        throw new Error(result.message);
                                    }

                                    alert('Registration successful! Please log in.');
                                    // Corrected: Redirect to the login HTML page
                                    window.location.href = '/ngo-dashboard.html'; 
                            }
                        }
                    }   
             else if (role === 'donor') 
                    {
                        // If the user is a donor, we don't need a security code
                        if (document.getElementById('security-code'))
                        {
                            document.getElementById('security-code').value = ''; // Clear any existing value
                        }
                        const response = await fetch('/api/register', {
                        method: "POST",
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ first_name, last_name, email, password, role })
                        });

                        const result = await response.json();

                        if (!response.ok) 
                        {
                            throw new Error(result.message);
                        }
                        alert('Registration successful! Please log in.');
                        // Corrected: Redirect to the login HTML page
                        window.location.href = '/donor-dashboard.html'; 
                    }
        }
        catch (error) {
                console.error('Registration failed:', error);
                alert(`Registration failed: ${error.message}`);
            }
    });
}


// --- LOGIN PAGE LOGIC ---
const loginForm = document.getElementById('loginForm');
const loginBtn=document.getElementById('donor-login-btn');
const ngologinBtn=document.getElementById('ngo-login-btn');
let role="donor";
loginBtn.addEventListener('click', function() {
    role = "donor";
    loginBtn.classList.add('active');
    ngologinBtn.classList.remove('active');
});
ngologinBtn.addEventListener('click', function() {
    role = "ngo";
    ngologinBtn.classList.add('active');
    loginBtn.classList.remove('active');
});
if (loginForm) {
  loginForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;


    try {
      const response = await fetch('/api/login', {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message);
      }

      // Store user data
      localStorage.setItem('currentUser', JSON.stringify(result));
      alert('Login successful!');

      // Redirect based on role
      if (result.user.role === 'donor') {
        window.location.href = '/donor-dashboard.html';
      } else if (result.user.role === 'ngo') {
        window.location.href = '/ngo-dashboard.html';
      }

    } catch (error) {
      console.error('Login failed:', error);
      alert(`Login failed: ${error.message}`);
    }
  });
}
