
const vscode = require(`vscode`);
const assert = require(`assert`);

const Parser = require(`../../src/parser`);
const Linter = require(`../../src/linter`);

const URI = vscode.Uri.parse(`source.rpgle`);

exports.qualified1 = async () => {
  const lines = [
    `**FREE`,
    `Dcl-Ds Kx Likerec(TitXe :*Key);`,
    `Dcl-s MyVariable2 Char(20);`,
    ``,
    `Dsply MyVariable2;`,
    ``,
    `Return`,
  ].join(`\n`);
  
  const parser = new Parser();
  const cache = await parser.getDocs(URI, lines);
  const { errors } = Linter.getErrors(lines, {
    QualifiedCheck: true,
  }, cache);
  
  assert.strictEqual(errors.length, 0, `Expect length of 0`);
},

exports.ctdata1 = async () => {
  const lines = [
    `**free`,
    `dcl-s myarray char(100) dim(10) ctdata;`,
    `dcl-s xxField1 char(1);`,
    `dcl-ds master qualified inz;`,
    ``,
    `  dcl-ds a inz;`,
    `    fielda1 Like(xxFiel1);`,
    `    fielda2 packed(2);`,
    `  End-ds;`,
    ``,
    `  dcl-ds b inz;`,
    `    fieldb1 like(xxField1);`,
    `    fieldb2 packed(9);`,
    `  End-ds;`,
    `End-ds;`,
    ``,
    ``,
    `eval master.a.fielda1 = 'a1';`,
    `eval master.a.f;`,
    `eval master.b.fieldb1 = 'b1';`,
    `//eval myds2.p.field1 = 'p';`,
    `//eval myds2.o.`,
    ``,
    `*INLR = *ON;`,
    `**ctdata myarray`,
    `select RMSDESC ,RMACRONYM ,RMLPID ,RMCBAPLAN ,LTTYPE ,LTID ,LTATTREA`,
    `,digits( RHHRTYPE ) as RHHRTYPE ,varchar( PWDES ,30 )`,
    ` ,EOEMP as EMP ,min( RHEFFDT ) as EFFDATE`,
    ` ,dec( 0.0 ,7,2 ) as Hours`,
    ` ,dec( 0.0 ,10,5 ) as Earned`,
    ` ,dec( 0.0 ,7,2 ) as Taken`,
    ` ,dec( ifnull( PTHRS ,0 ) ,7,2 ) as Due`,
    ` ,dec( 0.0 ,7,2 ) as Prior`,
    ` ,'N' as SysGen`,
    `from PRPEMPV0 V0`,
    `cross join PRPLPMTB RM`,
    `inner join PRPLPTTB LO on LTLPID = RMLPID`,
    `inner join PRPLPHTB HT on RHLTID = LTID`,
    `inner join PRPPHRTP on PWHTP = RHHRTYPE`,
    `left  join PRPHWLTB PT on EOEMP = PTEMP and PTLPID = LTLPID and PTTID = LTID`,
    `       and ( PTDTEOW between date( xEARNED_LEAVE_TO_x ) -7 days`,
    `        and date( xEARNED_LEAVE_TO_x ) -1 days )`,
    `where EOEFFDT = ( select EOEFFDT from PRPEOCPF where EOEMP = V0.EOEMP`,
    `            anD EOEFFDT <=xEARNED_LEAVE_TO_8x order by EOEFFDT desc fetch first row only )`,
    `and   EHHDT = ( select EHHDT from PRPEHTPF where EHEMP = V0.EOEMP`,
    `            and EHHDT <=xEARNED_LEAVE_TO_8x order by EHHDT desc fetch first row only )`,
    `and   ETEFFDT= ( select ETEFFDT from PRPETXPF where ETEMP = V0.EOEMP`,
    `            and ETEFFDT <=xEARNED_LEAVE_TO_8x order by ETEFFDT desc fetch first row only )`,
    `and RMACRONYM = 'CBA'`,
    `and EOEMP = xEMP_USEx`,
    `and LTEFFDT = ( select LTEFFDT from PRPLPTTB LI where LO.LTLPID = LI.LTLPID`,
    `                and LO.LTTYPE = LI.LTTYPE`,
    `                and LI.LTEFFDT <= xEARNED_LEAVE_TO_x`,
    `                order by LTEFFDT desc fetch first row only ) and LTSTS = 'A'`,
    `and RHEFFDT = ( select RHEFFDT from PRPLPHTB I where I.RHLTID = HT.RHLTID`,
    `                and I.RHEFFDT <= xEARNED_LEAVE_TO_x`,
    `                order by RHEFFDT desc fetch first row only ) and RHHTSTS = 'A'`,
    `group by RMSDESC ,RMACRONYM ,RMLPID ,RMCBAPLAN ,LTTYPE ,LTID ,LTATTREA`,
    ` ,RHHRTYPE ,PWDES ,EOEMP ,PTHRS`,
    `order by RMLPID ,LTID ,EFFDATE`,
  ].join(`\n`);

  const parser = new Parser();
  const cache = await parser.getDocs(URI, lines);
  const { indentErrors } = Linter.getErrors(lines, {
    indent: 2
  }, cache);

  assert.strictEqual(indentErrors.length, 0, `Expect length of 0`);
},


exports.likeds1 = async () => {
  const lines = [
    `**FREE`,
    `Dcl-s MyVariable2 CHAR(20);`,
    `Dcl-Ds astructure qualified;`,
    `  Subitem1 CHAR(20);`,
    `  Subitem2 CHAR(20);`,
    `End-ds;`,
    `Dcl-s MyVariable CHAR(20);`,
    `Dcl-Ds MyOtherStruct LikeDS(Astructure);`,
    `//Yes`
  ].join(`\n`);

  const parser = new Parser();
  const cache = await parser.getDocs(URI, lines);

  assert.strictEqual(cache.variables.length, 2);
  assert.strictEqual(cache.structs.length, 2);

  const MyOtherStruct = cache.find(`MyOtherStruct`);
  assert.strictEqual(MyOtherStruct.name, `MyOtherStruct`);
  assert.strictEqual(MyOtherStruct.position.line, 7);
  assert.strictEqual(MyOtherStruct.subItems.length, 2);
},

exports.likeds2 = async () => {
  const lines = [
    `**FREE`,
    `Dcl-s MyVariable2 CHAR(20);`,
    `Dcl-Ds astructure qualified;`,
    `  Subitem1 CHAR(20);`,
    `  Subitem2 CHAR(20);`,
    `End-ds;`,
    `Dcl-s MyVariable CHAR(20);`,
    `Dsply MyVariable;`,
    `Return;`,
    `Dcl-Proc myprocedure;`,
    `  Dcl-Pi *N;`,
    `    inputDS Likeds(astructure);`,
    `  End-Pi;`,
    `  Dsply 'Inside';`,
    `  Return;`,
    `End-Proc;`
  ].join(`\n`);

  const parser = new Parser();
  const cache = await parser.getDocs(URI, lines);

  assert.strictEqual(cache.variables.length, 2);
  assert.strictEqual(cache.structs.length, 1);
  assert.strictEqual(cache.procedures.length, 1);

  const MyOtherStruct = cache.find(`myprocedure`);
  assert.strictEqual(MyOtherStruct.name, `myprocedure`);
  assert.strictEqual(MyOtherStruct.position.line, 9);
  assert.strictEqual(MyOtherStruct.subItems.length, 1);

  const parmInputDs = MyOtherStruct.subItems[0];
  assert.strictEqual(parmInputDs.name, `inputDS`);
  assert.strictEqual(parmInputDs.position.line, 11);
  assert.strictEqual(parmInputDs.subItems.length, 2);
},

exports.overload1 = async () => {
  const lines = [
    `**FREE`,
    ``,
    `Dcl-PR json_setBool pointer extproc(*CWIDEN : 'jx_SetBoolByName');`,
    `  node pointer value;`,
    `  nodePath pointer value options(*string);`,
    `  value ind value;`,
    `End-PR;`,
    ``,
    `Dcl-PR json_setNum pointer extproc(*CWIDEN : 'jx_SetDecByName');`,
    `  node pointer value;`,
    `  nodePath pointer value options(*string);`,
    `  value packed(30:15) value;`,
    `End-PR;`,
    ``,
    `Dcl-PR json_set pointer overload ( `,
    `    json_setBool: `,
    `    json_setNum `,
    `);`,
    ``,
    `Dcl-PR json_nodeType int(5) extproc(*CWIDEN : 'jx_GetNodeType');`,
    `  node pointer value;`,
    `End-PR;`,
  ].join(`\n`);

  const parser = new Parser();
  const cache = await parser.getDocs(URI, lines);

  const { indentErrors } = Linter.getErrors(lines, {
    indent: 2,
    PrettyComments: true
  }, cache);

  assert.strictEqual(cache.procedures.length, 4);
  assert.strictEqual(indentErrors.length, 0);
}