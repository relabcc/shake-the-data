import { useEffect, useState } from 'react';

import './App.css';
import DataShaker from './DataShaker';
import Logo from './Logo'

const pair = [
  {
    title: 'Rainy Days',
    zh: '全世界最常下雨的城市',
    en: 'World Cities That Have The Most Rainy Days',
    data: 'precip.json',
    sprite: 'umbrella.svg',
  },
  {
    title: 'Sunny Days',
    zh: '全世界日照最多的城市',
    en: 'World Cities That Have The Most Sunny Days',
    data: 'precip.json',
    sprite: 'sun.svg',
  }
]

function App() {
  const [dataIndex, setDataIndex] = useState(0);
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
  const activeData = pair[dataIndex]
  return mounted && (
    isPermitted ? (
      <div className={`wrapper is-${dataIndex ? 'light' : 'dark'}`}>
        <header className="flex align-start justify-space-between">
          <h1 className="title">{activeData.title}</h1>
          <Logo />
        </header>
        <main className="flex-grow">
          <DataShaker
            dataName={activeData.data}
            sprite={activeData.sprite}
            code="001"
            toggleData={() => setDataIndex(d => 1 - d)}
          />
        </main>
        <footer className="flex justify-space-between subtitle flex-wrap">
          <p className="cht">{activeData.zh}</p>
          <p className="eng">{activeData.en}</p>
        </footer>
      </div>
    ) : (
      <div className="notice">
        <p>本互動圖表需要偵測手機動作，點擊按鈕並「允許」權限後即可載入圖表</p>
        <button onClick={requestPermission}>允許偵測</button>
      </div>
    )
  )
}

export default App;
