// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";

// export default function Register() {
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setError("");

//     if (!name || !email || !password) {
//       setError("Please fill all fields");
//       return;
//     }

//     setLoading(true);

//     try {
//       // ---------------------------
//       // 1️⃣ BACKEND REGISTER (if running)
//       // ---------------------------
//       let backendSuccess = false;

//       try {
//         const res = await fetch("http://localhost:5000/api/register", {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify({ name, email, password }),
//         });

//         const data = await res.json();

//         if (!res.ok) {
//           setError(data.message || "Registration failed");
//         } else {
//           backendSuccess = true;
//         }
//       } catch (err) {
//         // If backend down → ignore error (local register will work)
//         console.warn("Backend not running, using local auth.");
//       }

//       // ---------------------------
//       // 2️⃣ LOCAL AUTH (always works)
//       // ---------------------------
//       let users = JSON.parse(localStorage.getItem("users")) || [];

//       if (users.find((u) => u.email === email)) {
//         setError("Email already registered");
//         setLoading(false);
//         return;
//       }

//       const newUser = { name, email, password };

//       users.push(newUser);
//       localStorage.setItem("users", JSON.stringify(users));

//       // Also log user in immediately
//       localStorage.setItem("user", JSON.stringify(newUser));

//       // ---------------------------
//       // 3️⃣ Redirect after success
//       // ---------------------------
//       navigate("/dashboard");
//     } catch (err) {
//       console.error(err);
//       setError("Network error. Try again.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="flex h-screen items-center justify-center bg-gray-100">
//       <form
//         onSubmit={handleSubmit}
//         className="w-full max-w-md bg-white shadow-lg rounded-xl p-8"
//       >
//         <h2 className="text-2xl font-bold mb-6 text-center">Create an Account</h2>

//         {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

//         <input
//           type="text"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           placeholder="Full Name"
//           className="w-full p-3 mb-3 border rounded-md"
//         />

//         <input
//           type="email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           placeholder="Email"
//           className="w-full p-3 mb-3 border rounded-md"
//         />

//         <input
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           placeholder="Password"
//           className="w-full p-3 mb-4 border rounded-md"
//         />

//         <button
//           disabled={loading}
//           className="w-full bg-green-600 text-white py-3 rounded-md"
//           type="submit"
//         >
//           {loading ? "Registering..." : "Register"}
//         </button>

//         <p className="text-center mt-4 text-sm">
//           Already have an account?{" "}
//           <Link to="/" className="text-blue-600 underline">
//             Login
//           </Link>
//         </p>
//       </form>
//     </div>
//   );
// }
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!name || !email || !password) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Registration failed.");
        setLoading(false);
        return;
      }

      // Save token + user
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err) {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white shadow-lg rounded-xl p-8"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Create Account</h2>

        {error && <div className="mb-4 text-red-600 text-sm">{error}</div>}

        <input
          type="text"
          placeholder="Full Name"
          className="w-full p-3 mb-3 border rounded-md"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 mb-3 border rounded-md"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 mb-4 border rounded-md"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={loading}
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-md"
        >
          {loading ? "Creating..." : "Register"}
        </button>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-blue-600 underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
