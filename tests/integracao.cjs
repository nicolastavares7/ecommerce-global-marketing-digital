const assert=require('node:assert/strict'), fs=require('fs'), vm=require('vm');
const raiz=require('path').resolve(__dirname,'..');
require(raiz+'/node_modules/dotenv').config({path:raiz+'/.env.dev'});
const mysql=require(raiz+'/node_modules/mysql2/promise');
const base='http://localhost:' + (process.env.APP_PORT || '3334');
async function pedir(caminho, method='GET',body,cookie){
 const res=await fetch(base+caminho,{method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:body===undefined?undefined:JSON.stringify(body)});
 const texto=await res.text(); return {status:res.status,body:texto?JSON.parse(texto):null,cookie:res.headers.get('set-cookie')};
}
(async()=>{
 const db=await mysql.createConnection({host:process.env.DB_HOST,user:process.env.DB_USER,password:process.env.DB_PASSWORD,port:process.env.DB_PORT,database:process.env.DB_DATABASE});
 const marca=Date.now(); const contas=[{nome:'Teste Dashboard A',email:`teste-${marca}-a@digitaltrack.local`,senha:'Teste123!',nivel:'Iniciante'},{nome:'Teste Dashboard B',email:`teste-${marca}-b@digitaltrack.local`,senha:'Teste123!',nivel:'Intermediário'}];
 try {
  assert.equal((await pedir('/simulacoes/listar')).status,401);
  for(const conta of contas) assert.equal((await pedir('/usuarios/cadastrar','POST',conta)).status,201);
  assert.equal((await pedir('/usuarios/cadastrar','POST',contas[0])).status,409);
  assert.equal((await pedir('/usuarios/autenticar','POST',{email:contas[0].email,senha:'errada'})).status,401);
  const a=await pedir('/usuarios/autenticar','POST',contas[0]), b=await pedir('/usuarios/autenticar','POST',contas[1]);
  assert.equal(a.status,200); assert.match(a.cookie,/HttpOnly/);assert.match(a.cookie,/SameSite=Strict/);
  // Login envia um clearCookie seguido do novo cookie; extraímos o token válido.
  const cookieA=a.cookie.match(/digitaltrack_sessao=([a-f0-9]{64})/)[0],cookieB=b.cookie.match(/digitaltrack_sessao=([a-f0-9]{64})/)[0];
  assert.deepEqual((await pedir('/simulacoes/listar','GET',undefined,cookieA)).body,[]);
  const dados={nome:'Organizador — teste Google',plataforma:'Google Ads',precoVenda:100,custoProduto:40,custoAnuncio:20,vendasDia:5};
  const criado=await pedir('/simulacoes/cadastrar','POST',{...dados,fk_usuario:b.body.id},cookieA); assert.equal(criado.status,201);
  const [linhas]=await db.execute('SELECT * FROM simulacao_cenario WHERE id=?',[criado.body.id]); assert.equal(linhas[0].fk_usuario,a.body.id); assert.equal(linhas[0].preco_venda_unidade,'100.00');
  assert.deepEqual((await pedir('/simulacoes/listar','GET',undefined,cookieB)).body,[]);
  assert.equal((await pedir('/simulacoes/excluir/'+criado.body.id,'DELETE',undefined,cookieB)).status,404);
  const contexto={document:{addEventListener(){},getElementById(){return {}}},console};
  let script=fs.readFileSync(raiz+'/public/js/dashboard.js','utf8').replace(/iniciar\(\);\s*$/,'');vm.createContext(contexto);vm.runInContext(script,contexto);
  const registro=(await pedir('/simulacoes/listar','GET',undefined,cookieA)).body[0], r=contexto.calcularSimulacao(registro);
  assert.equal(r.faturamento,15000);assert.equal(r.resultado,6000);assert.equal(r.margem,40);assert.equal(r.roas,5);
  assert.equal(contexto.calcularSimulacao({...registro,custoAnuncio:0}).roas,null);
  assert.equal(contexto.calcularSimulacao({...registro,vendasDia:0}).margem,null);
  assert.equal(contexto.calcularSimulacao({...registro,precoVenda:0}).margem,null);
  assert.equal(contexto.calcularSimulacao({...registro,custoProduto:110}).resultado,-4500);
  for(const ruim of [{precoVenda:-1},{precoVenda:1.001},{precoVenda:'20x'},{vendasDia:1.5},{plataforma:'inválida'},{nome:'  '}]) assert.equal((await pedir('/simulacoes/cadastrar','POST',{...dados,...ruim},cookieA)).status,400);
  assert.equal((await pedir('/usuarios/sair','POST',undefined,cookieA)).status,204);
  assert.equal((await pedir('/simulacoes/listar','GET',undefined,cookieA)).status,401);
  const novo=await pedir('/usuarios/autenticar','POST',contas[0]),novoCookie=novo.cookie.match(/digitaltrack_sessao=([a-f0-9]{64})/)[0];
  assert.equal((await pedir('/simulacoes/listar','GET',undefined,novoCookie)).body.length,1);
  assert.equal((await pedir('/simulacoes/excluir/'+criado.body.id,'DELETE',undefined,novoCookie)).status,204);
  assert.equal((await pedir('/simulacoes/listar','GET',undefined,novoCookie)).body.length,0);
  const [usuarios]=await db.execute('SELECT senha FROM usuario WHERE email=?',[contas[0].email]);assert.match(usuarios[0].senha,/^scrypt:/);assert.notEqual(usuarios[0].senha,contas[0].senha);
  console.log('PASSOU: cadastro real, duplicidade, hash, login, cookie, conta vazia, INSERT/SELECT/DELETE MySQL, isolamento entre contas, validações, persistência após novo login e fórmulas com zero/negativos.');
 }finally{
  for(const conta of contas){await db.execute('DELETE FROM simulacao_cenario WHERE fk_usuario IN (SELECT id FROM usuario WHERE email=?)',[conta.email]);await db.execute('DELETE FROM usuario WHERE email=?',[conta.email]);}await db.end();
 }
})().catch(e=>{console.error(e);process.exit(1)});
