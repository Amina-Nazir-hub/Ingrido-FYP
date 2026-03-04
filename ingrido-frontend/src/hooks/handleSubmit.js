const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('https://your-api.com/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if (response.ok) {
      alert("Registration Successful!");
    }
  } catch (error) {
    console.error("Error submitting form:", error);
  }
};