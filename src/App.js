import * as Matter from 'matter-js';
import { useEffect, useRef, useState } from 'react';
import 'pathseg'
import { scaleSqrt } from 'd3-scale'
import { min, max } from 'd3-array';
import sample from 'lodash/sample'
import round from 'lodash/round'

import './App.css';

var loadSvg = function (url) {
  return fetch(url)
    .then((response) => response.text())
    .then(raw => (new window.DOMParser()).parseFromString(raw, 'image/svg+xml'))
};

var select = function (root, selector) {
  return Array.prototype.slice.call(root.querySelectorAll(selector));
};

const getDist = (a, b) => Math.sqrt(Math.abs((b.x - a.x) * (b.y - a.y)))

const colors = ['#f19648', '#f5d259', '#f55a3c', '#063e7b', '#ececd1']

const getResizedUrl = async (src, ratio = 1) => new Promise((res) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const img = new Image();
  img.onload = () => {
    const { width, height } = img
    canvas.width = width * ratio
    canvas.height = height * ratio
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
      return res(URL.createObjectURL(blob))
    })
  }
  img.src = src
})

function App() {
  const [activeCity, setCity] = useState(null);
  const [modalPos, setModalPos] = useState({});

  const ref = useRef()
  const eventFiretime = useRef()
  useEffect(() => {
    ref.current.innerHTML = null
    const { width, height } = ref.current.getBoundingClientRect()
    var Engine = Matter.Engine,
      Render = Matter.Render,
      Runner = Matter.Runner,
      Events = Matter.Events,
      Common = Matter.Common,
      MouseConstraint = Matter.MouseConstraint,
      Mouse = Matter.Mouse,
      Composite = Matter.Composite,
      Svg = Matter.Svg,
      Body = Matter.Body,
      Bodies = Matter.Bodies;

    // create engine
    var engine = Engine.create(),
      world = engine.world;

    // create renderer
    var render = Render.create({
      element: ref.current,
      engine,
      options: {
        width,
        height,
        // showAngleIndicator: true,
        wireframes: false,
      }
    });

    Render.run(render);

    // create runner
    var runner = Runner.create();
    Runner.run(runner, engine);

    const barWidth = 50

    Composite.add(world, [
      Bodies.rectangle(width / 2, 0, width, barWidth, { isStatic: true }),
      Bodies.rectangle(width / 2, height, width, barWidth, { isStatic: true }),
      Bodies.rectangle(width, height / 2, barWidth, height, { isStatic: true }),
      Bodies.rectangle(0, height / 2, barWidth, height, { isStatic: true })
    ]);
    const spriteSize = 480
    const vmin = Math.min(width, height)
    const maxSize = vmin / spriteSize / 3
    loadSvg(`${process.env.PUBLIC_URL}/Umbrella.svg`).then(async (root) => {
      const data = await import('./data/precip.json')
      const rainData = data.default.map(d => [d.City, +d['% Days'], d.Country])
      const getValue = d => d[1]
      const scale = scaleSqrt()
        .domain([min(rainData, getValue), max(rainData, getValue)])
        .range([maxSize * 0.5, maxSize])
      const vertexSets = select(root, 'path').map(function (path) {
        return Svg.pathToVertices(path)
      })
      const svgEle = root.querySelector('svg')
      await Promise.all(rainData.map(async city => {
        const s = scale(getValue(city))
        root.querySelector('path')?.setAttribute('fill', sample(colors))
        const texture = await getResizedUrl(`data:image/svg+xml,${encodeURIComponent(svgEle?.outerHTML)}`, s)
        const box = Bodies.fromVertices(width / 2, Math.random() * height / 2, vertexSets, {
          render: {
            sprite: {
              texture,
            }
          }
        }, true)
        box.label = `${city[0]}, ${city[2]}\n(${round(city[1] * 100, 2)}%)`
        Body.scale(box, s, s)
        Composite.add(world, box)

        return box.id
      }))

    });

    // add gyro control
    if (typeof window !== 'undefined') {
      var updateGravity = function (event) {
        var orientation = typeof window.orientation !== 'undefined' ? window.orientation : 0,
          gravity = engine.gravity;
        var factor = 20

        if (orientation === 0) {
          gravity.x = Common.clamp(event.gamma, -90, 90) / factor;
          gravity.y = Common.clamp(event.beta, -90, 90) / factor;
        } else if (orientation === 180) {
          gravity.x = Common.clamp(event.gamma, -90, 90) / factor;
          gravity.y = Common.clamp(-event.beta, -90, 90) / factor;
        } else if (orientation === 90) {
          gravity.x = Common.clamp(event.beta, -90, 90) / factor;
          gravity.y = Common.clamp(-event.gamma, -90, 90) / factor;
        } else if (orientation === -90) {
          gravity.x = Common.clamp(-event.beta, -90, 90) / factor;
          gravity.y = Common.clamp(event.gamma, -90, 90) / factor;
        }
      };

      window.addEventListener('deviceorientation', updateGravity);
    }

    // add mouse control
    var mouse = Mouse.create(render.canvas),
      mouseConstraint = MouseConstraint.create(engine, {
        mouse,
        constraint: {
          stiffness: 0.2,
          render: {
            visible: false
          }
        }
      });

    Composite.add(world, mouseConstraint);

    Events.on(mouseConstraint, "enddrag", (e) => {
      if (getDist(e.mouse.mousedownPosition, e.mouse.mouseupPosition) < 10) {
        eventFiretime.current = Date.now()
        setCity(e.body.label)
        setModalPos(e.mouse.position)
      }
    })

    Events.on(mouseConstraint, "mouseup", (e) => {
      if (Date.now() - eventFiretime.current > 500) setCity(null)
    })

    // keep the mouse in sync with rendering
    render.mouse = mouse;
  }, [])

  return (
    <>
      <div className="App" ref={ref} />
      {activeCity && (
        <div
          style={{
            position: 'absolute',
            left: modalPos.x,
            top: modalPos.y,
            transform: 'translate(-50%, -50%)',
          }}
          className="label-box"
        >
          <p>{activeCity}</p>
        </div>
      )}
    </>
  )
}

export default App;
