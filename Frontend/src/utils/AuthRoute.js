import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

const AuthRoute = ({children, restricted = false})=>{
    const {isAuthenticated} = useSelector((state)=>state.auth)
    if(isAuthenticated && restricted){
        return <Navigate to="/foryou" replace/>;
    }
    if(!isAuthenticated && !restricted){
        return <Navigate to="/login" replace/>;
    }
    return children;
}

export default AuthRoute;