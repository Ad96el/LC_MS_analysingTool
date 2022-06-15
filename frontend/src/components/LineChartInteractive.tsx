/* eslint-disable brace-style */
import { Button, CircularProgress, Typography } from '@material-ui/core';
import React from 'react';
import Tooltip from '@material-ui/core/Tooltip';
import {
  LineChart, Line, XAxis, YAxis, ReferenceArea, Label, ReferenceDot,
  ReferenceLine, ResponsiveContainer,
} from 'recharts';
import * as reC from 'recharts';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { useTranslate, useNotify } from 'react-admin';
import { toPng } from 'html-to-image';
import { LTD } from 'downsample';

// ownlibs
import * as Types from 'types';

// interfaces
interface GraphI{
  parentRef: React.RefObject<HTMLDivElement>,
  addPeak?: (intervall: number[]) => void,
  handleIntervallChange?: (intervall: number[]) => void,
  loading: boolean,
  dataRow: Types.dataChart[]
  half: boolean
  highlightDots: Types.highlightDot[]
  highlightStroke: Types.highlightStroke[]
  highlightArea: number[]
  highlightLine: Types.highlightLine[]
  width: number,
  xAxisLabel: string
  yAxisLabel: string
  dataKeyx: string
  showLegend:boolean
  reduced : boolean,
}

interface GraphWrapperI{
    width: number,
    addPeak?: (intervall: number[]) => void,
    handleIntervallChange?: (intervall: number[]) => void,
    loading?: boolean
    data: Types.dataChart[],
    half?: boolean
    highlightDots?: Types.highlightDot[]
    highlightStroke?: Types.highlightStroke[]
    highlightArea?: number[]
    highlightLine?: Types.highlightLine[]
    xAxisLabel?: string
    yAxisLabel?: string
    dataKeyx?: string
    showLegend?: boolean
    reduced? : boolean,
  }

const calculateDistancIndex = (point: number, array : number[]) => {
  const distance = array.map((cor) => Math.abs(cor - point));

  return distance.indexOf(Math.min(...distance));
};

const useStyles = makeStyles((theme: Theme) => createStyles({
  button: {
    margin: theme.spacing(1),
  },
  buttonContainer: {
    marginLeft: theme.spacing(0),
    margin: theme.spacing(1),
    flexDirection: 'row',
    display: 'flex',
  },
  Chart: {
    width: '100%',
  },
}));

const REDUCE_FACTOR = 5000;

const getAxisYDomain = (from: number, to: number, dataChart : Types.dataChart[]) => {
  const topCandidates : number[] = [];
  const bottomCandidates : number[] = [];
  dataChart.forEach((obj) => {
    const refData = obj.data.filter((point) => point.x >= from && point.x <= to);
    if (refData.length !== 0) {
      let [bottom, top] = [refData[0][obj.dataKey], refData[0][obj.dataKey]];
      refData.forEach((d) => {
        if (d[obj.dataKey] > top) top = d[obj.dataKey];
        if (d[obj.dataKey] < bottom) bottom = d[obj.dataKey];
      });
      topCandidates.push(top);
      bottomCandidates.push(bottom);
    }
  });

  const smallestBottom = Math.min(...bottomCandidates);
  const biggestTop = Math.max(...topCandidates);
  return [Math.floor(smallestBottom), Math.ceil(biggestTop)];
};

const Chart : React.FC<GraphI> = ({
  parentRef, addPeak, handleIntervallChange, loading, dataRow, half, dataKeyx, reduced,
  highlightDots, highlightStroke, highlightArea, highlightLine, width, xAxisLabel, yAxisLabel,
  showLegend,
}) => {
  // states
  const [left, setLeft] = React.useState<number | string>('auto');
  const [right, setRight] = React.useState<number | string>('auto');
  const [refAreaLeft, setRefAreaLeft] = React.useState<number | string>('');
  const [refAreaRight, setRefAreaRight] = React.useState<number | string>('');
  const [top, setTop] = React.useState<number | string>(0);
  const [bottom, setBottom] = React.useState<number | string>(0);
  const [mod, setMod] = React.useState<string>('zoom');
  const [customMod, setCustomMod] = React.useState<string>('None');
  const [data, setData] = React.useState<Types.dataChart[]>([]);
  const [count, setCount] = React.useState<number>(0);
  const [reducedData, setReducedData] = React.useState<Types.dataChart[]>([]);
  const [usedReducedData, setUsedReducedData] = React.useState(false);

  // hocks
  const translate = useTranslate();
  const classes = useStyles();
  const ref = React.useRef<HTMLDivElement>(null);
  const notify = useNotify();

  React.useEffect(() => {
    setUsedReducedData(false);
    setReducedData([]);
    setData(dataRow);
    setCount(dataRow.length);
    setLeft('auto');
    setRight('auto');
    setBottom('auto');
    setTop('auto');
  }, [dataRow]);

  React.useEffect(() => {
    const reducedDataUpdate : Types.dataChart[] = [];
    data.forEach((graph) => {
      if (reduced && graph.data.length > REDUCE_FACTOR && left === 'auto' && right === 'auto') {
        const rdata = (LTD(graph.data as any, REDUCE_FACTOR) as any) as Types.dataPoint[];
        const updatedGraph = { ...graph };
        updatedGraph.data = rdata;
        reducedDataUpdate.push(updatedGraph);
        setUsedReducedData(true);
      } else if (reduced && graph.data.length > REDUCE_FACTOR && left !== 'auto' && right !== 'auto') {
        const startIndex = calculateDistancIndex(left as number, graph.data.map((obj) => obj.x));
        const endIndex = calculateDistancIndex(right as number, graph.data.map((obj) => obj.x));

        const dataSclice = graph.data.slice(startIndex, endIndex);

        if (endIndex - startIndex < REDUCE_FACTOR) {
          const updatedGraph = { ...graph };
          updatedGraph.data = dataSclice;
          reducedDataUpdate.push(updatedGraph);
          setUsedReducedData(false);
        } else {
          const updatedGraph = { ...graph };
          updatedGraph.data = (LTD(dataSclice as any, REDUCE_FACTOR) as any) as Types.dataPoint[];
          reducedDataUpdate.push(updatedGraph);
          setUsedReducedData(true);
        }
      }
    });

    setReducedData(reducedDataUpdate);
  }, [data, left, right]);

  React.useEffect(() => {
    const context = parentRef.current;
    if (!context) {
      return;
    }

    const showMenu = (event: { preventDefault: () => void;
      button: React.SetStateAction<number>; }) => {
      event.preventDefault();
      if (event.button === 0 && mod !== 'spectrum') { setMod('zoom'); }
      else if (event.button === 1 && mod !== 'spectrum') { setMod('zoomout'); }
      else if (!addPeak) { setMod('zoom'); }
      else if (event.button === 2 && mod !== 'spectrum') { setMod('peek'); }
    };

    context.addEventListener('mousedown', showMenu);
    context.addEventListener('contextmenu', (event: { preventDefault: () => void; }) => { event.preventDefault(); });
    // eslint-disable-next-line consistent-return
    return () => {
      context.removeEventListener('mousedown', showMenu);
      context.removeEventListener('contextmenu',
        (event: { preventDefault: () => void; }) => { event.preventDefault(); });
    };
  });

  // functions

  const zoom = () => {
    const refAL = refAreaLeft > refAreaRight ? refAreaRight : refAreaLeft;
    const refAR = refAreaLeft < refAreaRight ? refAreaRight : refAreaLeft;
    if (refAL === '' || refAR === '' || !refAL || !refAR) { return; }

    const [bottomUpt, topUpt] = getAxisYDomain(+refAL, +refAR, data);
    setRefAreaLeft('');
    setRefAreaRight('');
    setLeft(refAL);
    setRight(refAR);
    setBottom(bottomUpt);
    setTop(topUpt);
  };

  const zoomOut = () => {
    setRefAreaLeft('');
    setRefAreaRight('');
    setLeft('auto');
    setRight('auto');
    setTop('auto');
    setBottom('auto');
  };

  const createImage = React.useCallback(() => {
    if (ref.current === null) {
      return;
    }

    toPng(ref.current, { cacheBust: true })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = 'plot.png';
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        notify(err.message, 'warning');
      });
  }, [ref]);

  const peekPicking = () => {
    if (count === 1) {
      if (addPeak && typeof refAreaRight !== 'string' && typeof refAreaRight !== 'string') {
        addPeak([refAreaLeft as number, refAreaRight as number]);
      }
      const intervall : number[] = [refAreaLeft as number, refAreaRight as number];
      if (handleIntervallChange && typeof refAreaRight !== 'string' && typeof refAreaRight !== 'string') {
        handleIntervallChange(intervall);
      }
      setRefAreaLeft('');
      setRefAreaRight('');
    }
  };

  const handlemouseDown = (e: { activeLabel: React.SetStateAction<string | number>; }) => {
    if (e) { setRefAreaLeft(e.activeLabel); }
  };

  const handlemouseMove = (e: { activeLabel: React.SetStateAction<string | number>; }) => {
    if (e && refAreaLeft && e.activeLabel) { setRefAreaRight(e.activeLabel); }
    else {
      setRefAreaLeft('');
    }
  };

  const handleEvents = () => {
    if (mod === 'zoomout') { zoomOut(); }
    else if (refAreaLeft === refAreaRight || refAreaRight === '') {
      setRefAreaLeft('');
      setRefAreaRight('');
    }
    else if (customMod === 'peek') { peekPicking(); }
    else if (customMod === 'zoom') { zoom(); }
    else if (mod === 'zoom' && customMod === 'None') { zoom(); }
    else if (mod === 'peek' && customMod === 'None') { peekPicking(); }
  };

  const handleClick = (customModUpt: string) => {
    if (customModUpt === customMod) { setCustomMod('None'); } else { setCustomMod(customModUpt); }
  };

  return (
    <div className="highlight-bar-charts">
      <div className={classes.buttonContainer}>
        <Tooltip title={translate('resources.routes.peakpicking.zoomtip')}>
          <Button
            variant="contained"
            className={classes.button}
            onClick={() => { handleClick('zoom'); }}
            color={customMod === 'zoom' ? 'secondary' : 'default'}
          >
            {translate('resources.routes.peakpicking.zoom')}
          </Button>
        </Tooltip>
        <Tooltip title={translate('resources.routes.peakpicking.zoomotip')}>
          <Button
            variant="contained"
            className={classes.button}
            onClick={() => { zoomOut(); }}
            color="default"
          >
            {translate('resources.routes.peakpicking.zoomo')}
          </Button>
        </Tooltip>
        <Tooltip title={translate('resources.routes.peakpicking.pngtip')}>
          <Button
            variant="contained"
            className={classes.button}
            onClick={() => { createImage(); }}
            color="default"
          >
            {translate('resources.routes.peakpicking.png')}
          </Button>
        </Tooltip>
        {addPeak && (
        <Tooltip title={translate('resources.routes.peakpicking.selecttip')}>
          <Button
            variant="contained"
            className={classes.button}
            onClick={() => { handleClick('peek'); }}
            color={customMod === 'peek' ? 'secondary' : 'default'}
          >
            {translate('resources.routes.peakpicking.select')}
          </Button>
        </Tooltip>
        )}

        {reduced && usedReducedData && (
        <Typography style={{ margin: '1em', marginBottom: 0, color: 'red' }} variant="subtitle1" color="textSecondary">
          {translate('resources.routes.sample.reduceData') }
        </Typography>

        )}

      </div>
      <div className={classes.Chart}>
        {loading ? (
          <div style={{
            height: half ? 500 : window.innerHeight * 0.45,
            marginLeft: window.innerWidth * (half ? 0.2 : 0.4),
          }}
          >
            <CircularProgress />
          </div>
        ) : (
          <>
            <div style={{ height: half ? 500 : window.innerHeight * 0.58 }} ref={ref}>
              <ResponsiveContainer height={half ? 550 : window.innerHeight * 0.56} width="95%">
                <LineChart
                  width={width}
                  height={half ? 500 : window.innerHeight * 0.56}
                  onMouseDown={handlemouseDown}
                  margin={{
                    top: 20, right: 20, bottom: 20, left: 20,
                  }}
                  onMouseMove={handlemouseMove}
                  onMouseUp={handleEvents}
                >

                  { highlightStroke && highlightStroke.map((stroke) => <ReferenceLine key={stroke.id} yAxisId="1" x={stroke.x} label={stroke.label} stroke={stroke.color} />) }
                  { highlightDots && highlightDots.map((dot) => <ReferenceDot key={dot.id} yAxisId="1" x={dot.x} r={5} y={dot.y} label={dot.label} fill={dot.color} />) }
                  { highlightLine && highlightLine.map((line) => (
                    <ReferenceLine
                      yAxisId="1"
                      key={line.id}
                      label={`${line.label}`}
                      segment={[
                        { x: line.x1, y: line.y1 },
                        { x: line.x2, y: line.y2 }]}
                      stroke={line.color}
                    />
                  ))}
                  {data.length === 1 && <reC.Tooltip /> }
                  <XAxis
                    allowDataOverflow
                    dataKey={dataKeyx || 'x'}
                    domain={[left, right]}
                    type="number"
                  >
                    <Label value={xAxisLabel} offset={-5} position="insideBottom" />
                  </XAxis>
                  <YAxis
                    allowDataOverflow
                    domain={[bottom, top]}
                    type="number"
                    offset={-5}
                    label={{
                      value: yAxisLabel, angle: -90, position: 'insideLeft',
                    }}
                    yAxisId="1"
                  />

                  {reduced && reducedData.length > 0 ? reducedData.map((graph) => (
                    <Line
                      data={graph.data}
                      yAxisId="1"
                      dot={false}
                      type="linear"
                      dataKey={graph.dataKey}
                      isAnimationActive={false}
                      stroke={graph.color}
                    />

                  )) : data.length > 0 && data.map((graph) => (
                    <Line
                      data={graph.data}
                      yAxisId="1"
                      dot={false}
                      isAnimationActive={false}
                      type="linear"
                      dataKey={graph.dataKey}
                      stroke={graph.color}
                    />
                  ))}

                  {highlightArea.length === 2 && (
                  <ReferenceArea
                    yAxisId="1"
                    x1={highlightArea[0]}
                    x2={highlightArea[1]}
                    strokeOpacity={0.1}
                    stroke="green"
                  />
                  )}

                  {refAreaLeft && refAreaRight ? (
                    <ReferenceArea
                      yAxisId="1"
                      x1={refAreaLeft}
                      x2={refAreaRight}
                      strokeOpacity={0.3}
                      stroke="blue"
                    />
                  ) : null}
                  { showLegend && <reC.Legend verticalAlign="bottom" align="center" height={36} wrapperStyle={{ bottom: -80 }} />}
                </LineChart>
              </ResponsiveContainer>
            </div>

          </>
        ) }

      </div>
    </div>
  );
};

const GraphWrapper : React.FC<GraphWrapperI> = ({
  addPeak = undefined, handleIntervallChange = undefined, loading = false,
  half = false, highlightDots = [], highlightStroke = [], highlightArea = [], highlightLine = [],
  width, xAxisLabel = '', yAxisLabel = '', dataKeyx = 'x', data, showLegend = false, reduced = false,
}) => {
  const ref = React.useRef(null);
  return (
    <div ref={ref}>
      <Chart
        width={width}
        dataRow={data}
        addPeak={addPeak}
        handleIntervallChange={handleIntervallChange}
        loading={loading}
        parentRef={ref}
        half={half}
        highlightDots={highlightDots}
        highlightStroke={highlightStroke}
        highlightArea={highlightArea}
        highlightLine={highlightLine}
        xAxisLabel={xAxisLabel}
        yAxisLabel={yAxisLabel}
        dataKeyx={dataKeyx}
        showLegend={showLegend}
        reduced={reduced}
      />
    </div>
  );
};

export default GraphWrapper;
