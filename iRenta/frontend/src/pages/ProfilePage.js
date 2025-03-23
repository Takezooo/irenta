import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { fetchUserData } from "../global/api/Users.js"; // Adjust path if needed
import { fetchSpecificUserListings } from "../global/api/Listings.js";
import { GetToken } from "../global/utils/Token";

const ProfilePage = () => {
  const { id } = useParams(); // Get user ID from URL
  const [profile, setProfile] = useState(null);
  const [listings, setListings] = useState([]); // Store user listings
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const authToken = GetToken();

    // Fetch user profile
    fetchUserData(id, authToken)
      .then((data) => {
        if (data) {
          setProfile(data);
        }
      })
      .finally(() => setLoading(false));

    // Fetch listings by the user
    fetchSpecificUserListings(id).then((data) => {
      if (data) {
        setListings(data);
      }
    });
  }, [id]);
  
  console.log(id);
  if (loading) return <p>Loading...</p>;
  if (!profile) return <p>User not found.</p>;

  return (
    <div>
      <h1>{profile.name}'s Profile</h1>
      <p>Email: {profile.email}</p>
      <h2>Listings by {profile.name}</h2>
      {listings.length > 0 ? (
        <ul>
          {listings.map((listing) => (
            <li key={listing.id}>{listing.title}</li>
          ))}
        </ul>
      ) : (
        <p>No listings found.</p>
      )}
    </div>
  );
};

export default ProfilePage;
