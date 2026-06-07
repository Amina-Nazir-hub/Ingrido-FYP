// utils/alertUtils.js
import Swal from "sweetalert2";

/**
 * Show error alert
 * @param {string} message - Error message to display
 * @param {Object} options - Additional SweetAlert2 options
 */
export const showErrorAlert = (message, options = {}) => {
  return Swal.fire({
    title: "Error!",
    text: message,
    icon: "error",
    confirmButtonColor: "#6D001A",
    confirmButtonText: "Try Again",
    timer: 3000,
    showConfirmButton: true,
    toast: false,
    position: "center",
    backdrop: true,
    allowOutsideClick: false,
    allowEscapeKey: true,
    ...options
  });
};

/**
 * Show success alert
 * @param {string} message - Success message to display
 * @param {Object} options - Additional SweetAlert2 options
 */
export const showSuccessAlert = (message, options = {}) => {
  return Swal.fire({
    title: "Success!",
    text: message,
    icon: "success",
    confirmButtonColor: "#6D001A",
    confirmButtonText: "Continue",
    timer: 2000,
    showConfirmButton: true,
    position: "center",
    backdrop: true,
    allowOutsideClick: false,
    ...options
  });
};

/**
 * Show welcome back alert for login success
 * @param {string} userName - User's name
 * @param {Object} options - Additional SweetAlert2 options
 */
export const showWelcomeBackAlert = (userName, options = {}) => {
  return Swal.fire({
    title: "Welcome Back! 🎉",
    text: `Successfully logged in as ${userName}`,
    icon: "success",
    confirmButtonColor: "#6D001A",
    confirmButtonText: "Continue to Dashboard",
    timer: 2500,
    showConfirmButton: true,
    position: "center",
    backdrop: true,
    allowOutsideClick: false,
    ...options
  });
};

/**
 * Show loading alert
 * @param {string} title - Loading title
 * @param {string} message - Loading message
 * @param {Object} options - Additional SweetAlert2 options
 */
export const showLoadingAlert = (title = "Please Wait...", message = "Processing your request", options = {}) => {
  return Swal.fire({
    title: title,
    text: message,
    icon: "info",
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    position: "center",
    backdrop: true,
    didOpen: () => {
      Swal.showLoading();
    },
    ...options
  });
};

/**
 * Show info alert
 * @param {string} title - Info title
 * @param {string} message - Info message
 * @param {Object} options - Additional SweetAlert2 options
 */
export const showInfoAlert = (title, message, options = {}) => {
  return Swal.fire({
    title: title,
    text: message,
    icon: "info",
    confirmButtonColor: "#6D001A",
    confirmButtonText: "Got it",
    position: "center",
    backdrop: true,
    allowOutsideClick: false,
    ...options
  });
};

/**
 * Show warning alert
 * @param {string} title - Warning title
 * @param {string} message - Warning message
 * @param {Object} options - Additional SweetAlert2 options
 */
export const showWarningAlert = (title, message, options = {}) => {
  return Swal.fire({
    title: title,
    text: message,
    icon: "warning",
    confirmButtonColor: "#6D001A",
    confirmButtonText: "OK",
    position: "center",
    backdrop: true,
    allowOutsideClick: false,
    ...options
  });
};

/**
 * Show confirmation dialog
 * @param {string} title - Confirmation title
 * @param {string} message - Confirmation message
 * @param {Object} options - Additional SweetAlert2 options
 * @returns {Promise<boolean>} - Returns true if confirmed, false otherwise
 */
export const showConfirmDialog = async (title, message, options = {}) => {
  const result = await Swal.fire({
    title: title,
    text: message,
    icon: "question",
    showCancelButton: true,
    confirmButtonColor: "#6D001A",
    cancelButtonColor: "#6b7280",
    confirmButtonText: "Yes",
    cancelButtonText: "No",
    position: "center",
    backdrop: true,
    allowOutsideClick: false,
    ...options
  });
  
  return result.isConfirmed;
};

/**
 * Close any open Swal alert
 */
export const closeAlert = () => {
  Swal.close();
};

// Default export for convenience
export default {
  showErrorAlert,
  showSuccessAlert,
  showWelcomeBackAlert,
  showLoadingAlert,
  showInfoAlert,
  showWarningAlert,
  showConfirmDialog,
  closeAlert
};