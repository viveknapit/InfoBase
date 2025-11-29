import { useDispatch, useSelector } from "react-redux"
import MainLayout from "./layouts/MainLayout"
import type { AppDispatch, RootState } from "./redux/store"
import { useEffect } from "react";
import { getUser } from "./services/UserServices";

const App = () => {
  return (
    <div>
        <MainLayout/>
    </div>
  )
}

export default App