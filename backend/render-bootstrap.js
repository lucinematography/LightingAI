import fs from 'node:fs/promises';

if (process.env.LIGHTINGAI_PREVIEW_TEST === '1') {
  await import('./preview-test-server.js');
} else {
  const runtimePath = new URL('./catalog-runtime.js', import.meta.url);
  const generatedRuntimePath = new URL('./catalog-runtime-render.js', import.meta.url);

  const runtimeSource = await fs.readFile(runtimePath, 'utf8');
  const exportShim = `\n\n// Render compatibility export generated at startup.\nconst __renderRuntimeCatalog = buildRuntimeCatalog();\n__renderRuntimeCatalog.fixtureById = new Map(__renderRuntimeCatalog.fixtures.map((item) => [item.id, item]));\n__renderRuntimeCatalog.accessoryById = new Map(__renderRuntimeCatalog.accessories.map((item) => [item.id, item]));\n__renderRuntimeCatalog.duplicateAccessoryIds = __renderRuntimeCatalog.integrity?.duplicateAccessoryIds || [];\n__renderRuntimeCatalog.missingAccessoryFixtureIds = __renderRuntimeCatalog.integrity?.missingAccessoryFixtureIds || [];\nexport const RUNTIME_CATALOG = __renderRuntimeCatalog;\n`;
  await fs.writeFile(generatedRuntimePath, runtimeSource + exportShim, 'utf8');

  for (const file of ['server.js', 'catalog-status.js']) {
    const sourcePath = new URL(`./${file}`, import.meta.url);
    const outputName = file.replace('.js', '-render.js');
    const outputPath = new URL(`./${outputName}`, import.meta.url);
    const source = await fs.readFile(sourcePath, 'utf8');
    let patched = source.replaceAll('./catalog-runtime.js', './catalog-runtime-render.js')
      .replaceAll('./catalog-status.js', './catalog-status-render.js');

    if (file === 'server.js') {
      patched = patched
        .replace(
          'const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });',
          'const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 45000, maxRetries: 0 });'
        )
        .replace(
          'app.post("/api/lighting-plan",async(req,res)=>{try{',
          'app.post("/api/lighting-plan",async(req,res)=>{const __diagStart=Date.now();const __diagId=String(req.body?.diagnosticId||`srv-${Date.now().toString(36)}`);console.log("[AI-DIAG]",__diagId,"request_received",{photoChars:String(req.body?.scenePhoto||"").length,equipment:Array.isArray(req.body?.equipment)?req.body.equipment.length:0});try{'
        )
        .replace(
          ' const response=await openai.responses.create({model:"gpt-5.6-luna",input:[{role:"user",content}]});',
          ' console.log("[AI-DIAG]",__diagId,"openai_start",{elapsedMs:Date.now()-__diagStart}); const response=await openai.responses.create({model:"gpt-5.6-luna",input:[{role:"user",content}]}); console.log("[AI-DIAG]",__diagId,"openai_done",{elapsedMs:Date.now()-__diagStart,requestId:response?._request_id||null});'
        )
        .replace(
          '}catch(error){console.error(error);res.status(500).json({error:"Lighting plan generation failed."});}});',
          '}catch(error){const __timeout=/timeout|timed out/i.test(String(error?.message||""))||String(error?.name||"").includes("Timeout");console.error("[AI-DIAG]",__diagId,"failed",{elapsedMs:Date.now()-__diagStart,stage:"openai",timeout:__timeout,errorName:String(error?.name||"Error"),message:String(error?.message||"").slice(0,180)});res.status(__timeout?504:500).json({error:"Lighting plan generation failed.",diagnostic:{id:__diagId,stage:"openai",timeout:__timeout,elapsedMs:Date.now()-__diagStart,errorName:String(error?.name||"Error")}});}});'
        );
    }

    await fs.writeFile(outputPath, patched, 'utf8');
  }

  await import('./server-render.js');
}
