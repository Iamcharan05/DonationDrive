const express = require("express");
const {MongoClient} = require("mongodb");
const path = require('path');
const app = express();
app.use(express.static(__dirname)); 
app.use(express.json());
const uri = "mongodb+srv://charan:charan2005@cluster0.34ktmel.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
async function run() {
                try {
                    await client.connect();
                    console.log("✅ Connected to MongoDB");
                    const database = client.db("DonationDrive");
                    const donorsCollection = database.collection("donors");
                    const ngosCollection = database.collection("ngo_members");
                    app.get('/', (req, res) => {
                        res.sendFile(path.join(__dirname, 'login.html'));
                    });
                    app.get('/donor-dashboard.html', (req, res) => {
                        res.sendFile(path.join(__dirname, 'donar-dashboard.html'));
                    });
                    app.get('/ngo-dashboard.html', (req, res) => {
                        res.sendFile(path.join(__dirname, 'ngo-dashboard.html'));
                    });


                app.post("/api/register", async (req, res) => 
                {
                    try 
                    {
                        const { first_name, last_name, email, password, role } = req.body;
                        if (role == 'donor')
                        {
                            const collection =donorsCollection;
                            const newUser =
                            {
                                first_name:first_name,
                                last_name:last_name,
                                email:email,
                                password:password,
                                role:role 
                            };
                            newUser.donations = [];
                            await collection.insertOne(newUser);
                            return res.status(201).json({ message: "Registration successful!" });
                        }
                        else
                        {
                            const collection = ngosCollection;
                            const newUser =
                            {
                                first_name:first_name,
                                last_name:last_name,
                                email:email,
                                password:password,
                                role:role 
                            };
                            await collection.insertOne(newUser);
                            return res.status(201).json({ message: "Registration successful!" });
                        }
                    }
                    catch (error) 
                    {
                        return res.status(500).json({ message: "Server error during registration." });
                    }
                });
                // LOGIN API
                app.post("/api/login", async (req, res) => {
                    try {
                        const { email, password,role} = req.body;

                        let user;
                        if (role == 'donor')
                        {
                            user = await donorsCollection.findOne({ email, password });
                        } else if (role == 'ngo') {
                            user = await ngosCollection.findOne({ email, password });
                        } else {
                            return res.status(400).json({ message: "Invalid role" });
                        }

                        if (!user) {
                            return res.status(401).json({ message: "Invalid email or password" });
                        }

                        // Login success
                        return res.status(200).json({
                            message: "Login successful",
                            user: {
                                first_name: user.first_name,
                                last_name: user.last_name,
                                email: user.email,
                                role: user.role
                            }
                        });

                    } catch (error) {
                        console.error("Login Error:", error);
                        return res.status(500).json({ message: "Server error during login." });
                    }
                });
                app.post("/api/get-donations", async (req, res) => {
                    try {
                        const { email,role} = req.body;

                        let user;
                        if (role == 'donor') {
                            user = await donorsCollection.findOne({email});
                        } else if (role == 'ngo') {
                            user = await ngosCollection.findOne({email});
                        } else {
                            return res.status(400).json({ message: "Invalid role" });
                        }

                        if (!user) {
                            return res.status(401).json({ message: "Invalid email or password" });
                        }
                        return res.status(200).json({
                            message: "Login successful",
                            user:user.donations
                        });

                    } catch (error) {
                        console.error("Login Error:", error);
                        return res.status(500).json({ message: "Server error during login." });
                    }
                });
                app.post("/api/donations/form", async (req, res) => {
                    try {
                        const { email, item, category, quantity, date } = req.body;
                        const donation = {
                            id: Date.now(), // Generate a unique ID
                            item,
                            category,
                            quantity,
                            date,
                            status: "pending" // Default status
                        };
                        const result = await donorsCollection.updateOne(
                            { email },
                            { $push: { donations: donation } }
                        );
                        if (result.modifiedCount === 0) {
                            return res.status(404).json({ message: "Donor not found" });
                        }
                        res.status(200).json({ message: "Donation added successfully" });
                    } catch (error) {
                        console.error("Error adding donation:", error);
                        res.status(500).json({ message: "Server error while adding donation" });
                    }
                });
                app.get("/api/ngo-donations", async (req, res) => {
                    try {
                        const donors = await database.collection("donors").find({}).toArray();
                        if (!donors || donors.length === 0) {
                            return res.status(404).json({ message: "No donors found" });
                        }
                        const donorDonations = donors
                            .filter(donor => donor.donations && Array.isArray(donor.donations) && donor.donations.length > 0)
                            .map(donor => ({
                                donorName: donor.first_name + " " + donor.last_name,
                                email: donor.email,
                                donations: donor.donations.map(donation => ({
                                    ...donation,
                                    id: donation.id || Date.now().toString(),
                                    status: donation.status || "pending"
                                }))
                            }));
                        res.status(200).json(donorDonations);
                    } catch (error) {
                        console.error("Error fetching donor donations:", error);
                        res.status(500).json({ message: "Server error while fetching donor donations" });
                    }
                });
                // Update donation status
            app.patch("/api/donations/:donationId/status", async (req, res) => {
                try {
                    const donationId = req.params.donationId;
                    
                    // Find the donor with this donation
                    const donor = await donorsCollection.findOne({
                        "donations.id": donationId
                    });

                    if (!donor) {
                        return res.status(404).json({ message: "Donation not found" });
                    }

                    // Find the donation in the array
                    const donation = donor.donations.find(d => d.id.toString() === donationId.toString());
                    
                    // Update the status
                    let newStatus = donation.status === 'pending' ? 'approved' : 'collected';
                    
                    // Update the donation status in the database
                    const result = await donorsCollection.updateOne(
                        { 
                            "donations.id": parseInt(donationId)
                        },
                        {
                            $set: {
                                "donations.$.status": newStatus
                            }
                        }
                    );

                    if (result.modifiedCount === 0) {
                        return res.status(400).json({ message: "Failed to update donation status" });
                    }

                        res.status(200).json({ message: "Status updated successfully", newStatus });
                    } catch (error) {
                        console.error("Error updating donation status:", error);
                        res.status(500).json({ message: "Server error while updating donation status" });
                    }
                });

                app.listen(3000, () => {
                    console.log("🚀 Server is running on port 3000");
                });

            } catch (err) {
                console.error("Failed to connect to MongoDB", err);
                process.exit(1);
            }
}
run();