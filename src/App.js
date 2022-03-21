import { useEffect, useState } from 'react';

import './App.css';
import DataShaker from './DataShaker';

function App() {
  const [mounted, setIsmounted] = useState(null)
  const [isPermitted, setIsPermitted] = useState()
  useEffect(() => {
    if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
      setIsPermitted(true)
    }
    setIsmounted(true)
  }, [])
  const requestPermission = () => {
    DeviceOrientationEvent.requestPermission()
      .then(permissionState => {
        if (permissionState === 'granted') {
          setIsPermitted(true)
        }
      })
      .catch(console.error);
  }
  return mounted && (
    isPermitted ? <DataShaker /> : (
      <div className="notice">
        <p>本圖表需要偵測手機動作，點擊按鈕並「允許」權限後即可載入圖表</p>
        <button onClick={requestPermission}>允許偵測</button>
      </div>
    )
  )
}

export default App;
