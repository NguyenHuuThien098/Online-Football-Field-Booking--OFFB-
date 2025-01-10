import { Navigate } from "react-router-dom";
const checkFieldOwner = () => {
    const token = localStorage.getItem('token');
    const ownerId = localStorage.getItem('userId');
    const role = localStorage.getItem('userRole');

    if (!ownerId) {
      //  alert('Owner ID not found');
        Navigate('/')
        return;
    }
    if (role !== 'field_owner') {
        // alert('Not an owner');
        Navigate('/')
        return;
    }
    if (!token) {
       // alert('No token found');
        Navigate('/')
        return;
    }
}

export default checkFieldOwner;