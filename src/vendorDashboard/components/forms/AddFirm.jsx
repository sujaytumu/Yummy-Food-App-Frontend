import React, { useState } from 'react';
import { API_URL } from '../../data/apiPath';
import { ThreeCircles } from 'react-loader-spinner';

const AddFirm = () => {
  const [firmName, setFirmName] = useState("");
  const [area, setArea] = useState("");
  const [category, setCategory] = useState([]);
  const [region, setRegion] = useState([]);
  const [offer, setOffer] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleCategoryChange = (event) => {
    const value = event.target.value;
    setCategory((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const handleRegionChange = (event) => {
    const value = event.target.value;
    setRegion((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
  };

  const handleImageUpload = (event) => {
    setFile(event.target.files[0]);
  };

  const uploadToCloudinary = async (file) => {
    const data = new FormData();
    data.append("file", file);
    data.append("upload_preset", "ml_default"); // ⚠️ replace with your preset
    data.append("cloud_name", "dw6srh3vk"); // ⚠️ replace with your cloud name

    const res = await fetch(`https://api.cloudinary.com/v1_1/dw6srh3vk/image/upload`, {
      method: "POST",
      body: data,
    });

    const cloudData = await res.json();
    return cloudData.secure_url;
  };

  const handleFirmSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const loginToken = localStorage.getItem('loginToken');
      if (!loginToken) {
        alert("Login required");
        return;
      }

      let imageUrl = "";
      if (file) {
        imageUrl = await uploadToCloudinary(file);
      }

      const body = {
        firmName,
        area,
        offer,
        category,
        region,
        image: imageUrl,
      };

      const response = await fetch(`${API_URL}/firm/add-firm`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${loginToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('firmId', data.firmId);
        localStorage.setItem('firmName', data.vendorFirmName);

        setFirmName("");
        setArea("");
        setCategory([]);
        setRegion([]);
        setOffer("");
        setFile(null);

        alert("Firm added Successfully");
        window.location.reload();
      } else {
        console.error("Firm add error:", data.message);
        alert(data.message || "Failed to add firm");
      }

    } catch (error) {
      console.error("Failed to add Firm", error);
      alert("Failed to add Firm");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="firmSection">
      {loading ? (
        <div className="loaderSection">
          <ThreeCircles visible height={100} width={100} color="#4fa94d" />
        </div>
      ) : (
        <form className="tableForm" onSubmit={handleFirmSubmit}>
          <h3>Add Firm</h3>
          <label>Firm Name</label>
          <input type="text" value={firmName} onChange={(e) => setFirmName(e.target.value)} />

          <label>Area</label>
          <input type="text" value={area} onChange={(e) => setArea(e.target.value)} />

          <div className="checkInp">
            <label>Category</label>
            <div className="inputsContainer">
              {['veg', 'non-veg'].map((cat) => (
                <div className="checboxContainer" key={cat}>
                  <label>{cat}</label>
                  <input
                    type="checkbox"
                    value={cat}
                    checked={category.includes(cat)}
                    onChange={handleCategoryChange}
                  />
                </div>
              ))}
            </div>
          </div>

          <label>Offer</label>
          <input type="text" value={offer} onChange={(e) => setOffer(e.target.value)} />

          <div className="checkInp">
            <label>Region</label>
            <div className="inputsContainer">
              {['south-indian', 'north-indian', 'chinese', 'bakery'].map((reg) => (
                <div className="regBoxContainer" key={reg}>
                  <label>{reg}</label>
                  <input
                    type="checkbox"
                    value={reg}
                    checked={region.includes(reg)}
                    onChange={handleRegionChange}
                  />
                </div>
              ))}
            </div>
          </div>

          <label>Firm Image</label>
          <input type="file" onChange={handleImageUpload} />

          <div className="btnSubmit">
            <button type="submit">Submit</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddFirm;
