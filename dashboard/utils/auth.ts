// Re-export from app utils so @/utils/auth resolves (components live outside app/)
export {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  getAuthHeaders,
} from "../app/utils/auth";
