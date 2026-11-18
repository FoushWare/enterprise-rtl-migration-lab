import asyncio,json,pathlib,edge_tts,subprocess
root=pathlib.Path(__file__).resolve().parents[1]
async def main():
 scenes=json.loads((root/'source/narration.json').read_text())
 for i,s in enumerate(scenes):
  p=root/f'audio/scene-{i+1:02}.mp3'
  await edge_tts.Communicate(s['text'],'ar-EG-ShakirNeural',rate='+8%').save(str(p))
  s['audioDuration']=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',str(p)]))
  s['duration']=s['audioDuration']+.45
 (root/'source/timing.json').write_text(json.dumps(scenes,ensure_ascii=False,indent=2))
asyncio.run(main())
