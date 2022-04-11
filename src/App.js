import { useEffect, useState } from 'react';

import './App.css';
import DataShaker from './DataShaker';
import logo from './logo.svg'

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
    isPermitted ? (
      <div className="wrapper">
        <div className="flex align-start justify-space-between">
          <h1 className="title">Rainy Days</h1>
          <img alt="No more..." src={logo} className="logo" />
        </div>
        <div className="flex-grow">
          <DataShaker dataName="precip.json" sprite="umbrella.svg" />
        </div>
        <div className="flex justify-space-between subtitle flex-wrap">
          <p>全世界最常下雨的城市</p>
          <p>World Cities That Have The Most Rainy Days</p>
        </div>
      </div>
    ) : (
      <div className="notice">
        <p>本圖表需要偵測手機動作，點擊按鈕並「允許」權限後即可載入圖表</p>
        <button onClick={requestPermission}>允許偵測</button>
      </div>
    )
  )
}

export default App;
