import React from "react";
import { useParams } from "react-router-dom";
import UserSideBar from "../../Components/UserProfile/UserSideBar";
import AccountSettings from "../../Components/UserProfile/AccountSettings"; // Correct import
import ViewTransactions from "../../Components/UserProfile/ViewTransactions";
import "./UserProfile.css";
import ChangePassword from "../../Components/UserProfile/ChangePassword";
import Address from "../../Components/UserProfile/address";

export const UserProfile = () => {
  const { activepage } = useParams();

  return (
    <div className="userprofile">
      <div className="userprofilein">
        <div className="left">
          <UserSideBar activepage={activepage} />
        </div>
        <div className="right">
          {activepage === "transactions" && <ViewTransactions />}
          {activepage === "accountsettings" && <AccountSettings />}
          {activepage === "changepassword" && <ChangePassword />}
          {activepage === "address" && <Address />}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
