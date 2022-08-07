import { useEffect, useState } from 'react';
import { useAsync } from 'react-use'
import { format } from 'd3-format'

import './App.css';
import DataShaker from './DataShaker';
import Logo from './Logo'

const pair = [
  'rain.json',
  'sun.json',
]

const parseLabel = (str, d) => str.replace(/{([^}]+)}(?:\[([^\]]+)\])?/g, (match, key, f) => {
  return f ? format(f)(d[key]) : d[key]
})

function App() {
  const [dataIndex, setDataIndex] = useState(0);
  const [mounted, setIsmounted] = useState(null)
  const [isPermitted, setIsPermitted] = useState()
  const { value } = useAsync(async () => {
    const data = await import(`./data/${pair[dataIndex]}`);
    const parsedData = data.data.map((d) => ({
      value: +d[data.value],
      label: parseLabel(data.label, d),
    }));
    return {
      ...data,
      data: parsedData,
    };
  }, [dataIndex])
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
      value ? (
        <div className={`wrapper is-${dataIndex ? 'light' : 'dark'}`}>
          <header className="flex align-start justify-space-between">
            <h1 className="title">{value.title}</h1>
            <Logo />
          </header>
          <main className="flex-grow">
            <DataShaker
              data={value.data}
              sprite={value.sprite}
              code="001"
              toggleData={() => setDataIndex(d => 1 - d)}
            />
          </main>
          <footer className="flex justify-space-between subtitle flex-wrap">
            <p className="cht">{value.zh}</p>
            <p className="eng">{value.en}</p>
          </footer>
        </div>
      ) : <p>Loading...</p>
    ) : (
      <div className="notice">
        <p>本互動圖表需要偵測手機動作，點擊按鈕並「允許」權限後即可載入圖表</p>
        <button onClick={requestPermission}>允許偵測</button>
      </div>
    )
  )
}

export default App;
