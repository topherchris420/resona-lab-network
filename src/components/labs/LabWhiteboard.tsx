import { useState, useRef, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Pencil, Eraser, Square, Circle, Trash2, Save, Undo } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Point {
  x: number;
  y: number;
}

interface DrawElement {
  id: string;
  type: 'path' | 'rect' | 'circle';
  points?: Point[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  color: string;
  strokeWidth: number;
}

interface LabWhiteboardProps {
  labId: string;
}

const LabWhiteboard = ({ labId }: LabWhiteboardProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<DrawElement[]>([]);
  const [history, setHistory] = useState<DrawElement[][]>([]);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'rect' | 'circle'>('pen');
  const [color, setColor] = useState('#06b6d4');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState<DrawElement | null>(null);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const { toast } = useToast();

  const colors = ['#06b6d4', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#ef4444', '#ffffff'];

  useEffect(() => {
    loadWhiteboard();
    setupRealtime();
  }, [labId]);

  useEffect(() => {
    redrawCanvas();
  }, [elements]);

  const loadWhiteboard = async () => {
    const { data, error } = await supabase
      .from('lab_whiteboards')
      .select('*')
      .eq('lab_id', labId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error loading whiteboard:', error);
    } else if (data?.canvas_data) {
      // canvas_data is already parsed by Supabase client
      setElements(data.canvas_data as unknown as DrawElement[]);
    }
  };

  const setupRealtime = () => {
    const channel = supabase.channel(`whiteboard:${labId}`)
      .on('broadcast', { event: 'draw' }, ({ payload }) => {
        setElements(payload.elements);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const broadcastElements = (newElements: DrawElement[]) => {
    supabase.channel(`whiteboard:${labId}`).send({
      type: 'broadcast',
      event: 'draw',
      payload: { elements: newElements }
    });
  };

  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    elements.forEach((el) => {
      ctx.strokeStyle = el.color;
      ctx.lineWidth = el.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      if (el.type === 'path' && el.points && el.points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(el.points[0].x, el.points[0].y);
        el.points.forEach((point) => ctx.lineTo(point.x, point.y));
        ctx.stroke();
      } else if (el.type === 'rect' && el.x !== undefined && el.y !== undefined) {
        ctx.strokeRect(el.x, el.y, el.width || 0, el.height || 0);
      } else if (el.type === 'circle' && el.x !== undefined && el.y !== undefined) {
        const radius = Math.sqrt(Math.pow(el.width || 0, 2) + Math.pow(el.height || 0, 2));
        ctx.beginPath();
        ctx.arc(el.x, el.y, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    // Draw current element
    if (currentElement) {
      ctx.strokeStyle = currentElement.color;
      ctx.lineWidth = currentElement.strokeWidth;
      
      if (currentElement.type === 'path' && currentElement.points) {
        ctx.beginPath();
        if (currentElement.points.length > 0) {
          ctx.moveTo(currentElement.points[0].x, currentElement.points[0].y);
          currentElement.points.forEach((point) => ctx.lineTo(point.x, point.y));
        }
        ctx.stroke();
      } else if (currentElement.type === 'rect' && currentElement.x !== undefined) {
        ctx.strokeRect(currentElement.x, currentElement.y!, currentElement.width || 0, currentElement.height || 0);
      } else if (currentElement.type === 'circle' && currentElement.x !== undefined) {
        const radius = Math.sqrt(Math.pow(currentElement.width || 0, 2) + Math.pow(currentElement.height || 0, 2));
        ctx.beginPath();
        ctx.arc(currentElement.x, currentElement.y!, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
  };

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setIsDrawing(true);
    setStartPoint(pos);
    setHistory([...history, elements]);

    if (tool === 'pen' || tool === 'eraser') {
      setCurrentElement({
        id: Date.now().toString(),
        type: 'path',
        points: [pos],
        color: tool === 'eraser' ? '#0a0a0f' : color,
        strokeWidth: tool === 'eraser' ? 20 : 3
      });
    } else {
      setCurrentElement({
        id: Date.now().toString(),
        type: tool,
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        color,
        strokeWidth: 3
      });
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentElement) return;
    const pos = getMousePos(e);

    if (tool === 'pen' || tool === 'eraser') {
      setCurrentElement({
        ...currentElement,
        points: [...(currentElement.points || []), pos]
      });
    } else if (startPoint) {
      setCurrentElement({
        ...currentElement,
        width: pos.x - startPoint.x,
        height: pos.y - startPoint.y
      });
    }
    redrawCanvas();
  };

  const stopDrawing = () => {
    if (!isDrawing || !currentElement) return;
    
    const newElements = [...elements, currentElement];
    setElements(newElements);
    broadcastElements(newElements);
    setCurrentElement(null);
    setIsDrawing(false);
    setStartPoint(null);
  };

  const undo = () => {
    if (history.length === 0) return;
    const prevElements = history[history.length - 1];
    setHistory(history.slice(0, -1));
    setElements(prevElements);
    broadcastElements(prevElements);
  };

  const clearCanvas = () => {
    setHistory([...history, elements]);
    setElements([]);
    broadcastElements([]);
  };

  const saveWhiteboard = async () => {
    // First check if a whiteboard exists for this lab
    const { data: existing } = await supabase
      .from('lab_whiteboards')
      .select('id')
      .eq('lab_id', labId)
      .single();

    // Convert elements to JSON-safe format
    const canvasJson = JSON.parse(JSON.stringify(elements));

    let error;
    if (existing) {
      const result = await supabase
        .from('lab_whiteboards')
        .update({ 
          canvas_data: canvasJson,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
      error = result.error;
    } else {
      const result = await supabase
        .from('lab_whiteboards')
        .insert([{ 
          lab_id: labId, 
          canvas_data: canvasJson,
        }]);
      error = result.error;
    }

    if (error) {
      console.error('Error saving whiteboard:', error);
      toast({ title: 'Failed to save whiteboard', variant: 'destructive' });
    } else {
      toast({ title: 'Whiteboard saved!' });
    }
  };

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex flex-wrap items-center gap-4 mb-4">
        <div className="flex gap-1">
          <Button
            variant={tool === 'pen' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setTool('pen')}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            variant={tool === 'eraser' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setTool('eraser')}
          >
            <Eraser className="w-4 h-4" />
          </Button>
          <Button
            variant={tool === 'rect' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setTool('rect')}
          >
            <Square className="w-4 h-4" />
          </Button>
          <Button
            variant={tool === 'circle' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setTool('circle')}
          >
            <Circle className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-1">
          {colors.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 transition-transform ${
                color === c ? 'scale-110 border-white' : 'border-transparent'
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="flex gap-1 ml-auto">
          <Button variant="outline" size="icon" onClick={undo} disabled={history.length === 0}>
            <Undo className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={clearCanvas}>
            <Trash2 className="w-4 h-4" />
          </Button>
          <Button onClick={saveWhiteboard} size="sm" className="bg-gradient-to-r from-primary to-accent">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={900}
        height={500}
        className="w-full rounded-lg cursor-crosshair border border-border"
        style={{ backgroundColor: '#0a0a0f' }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
      />
    </div>
  );
};

export default LabWhiteboard;
