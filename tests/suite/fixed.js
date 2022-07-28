
  
const vscode = require(`vscode`);
const assert = require(`assert`);

const Parser = require(`../../src/parser`);

const URI = vscode.Uri.parse(`source.rpgle`);
  
exports.fixed1 = async () => {
  const lines = [
    ``,
    `     FINVMST    IF   E           K DISK`,
    `   `,
    `     D wkCorp          S             10    inz('100')`,
    `     D wkInvoice       S             15`,
    `   `,
    `     C                   eval      wkInvoice = 'I035552120'`,
    `   `,
    `     C                   eval      *inlr = *on`,
  ].join(`\n`);

  const parser = new Parser();
  const cache = await parser.getDocs(URI, lines);

  assert.strictEqual(cache.variables.length, 2, `Expect length of 2`);

  const wkCorp = cache.variables[0];
  assert.strictEqual(wkCorp.name, `wkCorp`);
  assert.strictEqual(wkCorp.position.line, 3);
  assert.strictEqual(wkCorp.keywords[0], `CHAR(10)`);
  assert.strictEqual(wkCorp.keywords[1], `INZ('100')`);

  const wkInvoice = cache.variables[1];
  assert.strictEqual(wkInvoice.name, `wkInvoice`);
  assert.strictEqual(wkInvoice.position.line, 4);
  assert.strictEqual(wkInvoice.keywords[0], `CHAR(15)`);
};

exports.fixed2 = async () => {
  const lines = [
    ``,
    `      *`,
    `      *  Field Definitions.`,
    `      *`,
    `     d Count           s              4  0`,
    `     d Format          s              8`,
    `     d GenLen          s              8`,
    `     d InLibrary       s             10`,
    `     d InType          s             10`,
    `     d ObjectLib       s             20`,
    `     d SpaceVal        s              1    inz(*BLANKS)`,
    `     d SpaceAuth       s             10    inz('*CHANGE')`,
    `     d SpaceText       s             50    inz(*BLANKS)`,
    `     d SpaceRepl       s             10    inz('*YES')`,
    `     d SpaceAttr       s             10    inz(*BLANKS)`,
    `     d UserSpaceOut    s             20`,
    `     d Worktype        s             10    inz('*OUTQ')`,
    ``,
    `     `,
  ].join(`\n`);

  const parser = new Parser();
  const cache = await parser.getDocs(URI, lines);

  assert.strictEqual(cache.variables.length, 13, `Expect length of 13`);

  const CHARFields = cache.variables.filter(v => v.keywords[0].startsWith(`CHAR`));
  assert.strictEqual(CHARFields.length, 12, `Expect length of 12`);

  const countVar = cache.variables.find(v => v.name === `Count`);
  assert.strictEqual(countVar.keywords[0], `PACKED(4:0)`);
};

exports.fixed3 = async () => {
  const lines = [
    `     d Worktype        s             10    INZ('*OUTQ')`,
    ``,
    `      *`,
    `     d                 DS`,
    `     d  StartPosit             1      4B 0`,
    `     d  StartLen               5      8B 0`,
    `     d  SpaceLen               9     12B 0`,
    `     d  ReceiveLen            13     16B 0`,
    `     d  MessageKey            17     20B 0`,
    `     d  MsgDtaLen             21     24B 0`,
    `     d  MsgQueNbr             25     28B 0`,
  ].join(`\n`);

  const parser = new Parser();
  const cache = await parser.getDocs(URI, lines);

  assert.strictEqual(cache.variables.length, 1, `Expect length of 1`);
  assert.strictEqual(cache.structs.length, 1, `Expect length of 1`);
    
  const Worktype = cache.variables[0];
  assert.strictEqual(Worktype.name, `Worktype`);
  assert.strictEqual(Worktype.position.line, 0);
  assert.strictEqual(Worktype.keywords[0], `CHAR(10)`);
  assert.strictEqual(Worktype.keywords[1], `INZ('*OUTQ')`);

  const DS = cache.structs[0];
  assert.strictEqual(DS.name, `*N`);
  assert.strictEqual(DS.position.line, 3);
  assert.strictEqual(DS.subItems.length, 7);
  assert.strictEqual(DS.subItems.find(i => !i.keywords[0].startsWith(`BINDEC`)), undefined);
};

exports.fixed4 = async () => {
  const lines = [
    ``,
    `     d InType          s             10`,
    ``,
    `      *`,
    `      * Date structure for retriving userspace info`,
    `      *`,
    `     d InputDs         DS`,
    `     d  UserSpace              1     20`,
    `     d  SpaceName              1     10`,
    `     d  SpaceLib              11     20`,
    `     d  InpFileLib            29     48`,
    `     d  InpFFilNam            29     38`,
    `     d  InpFFilLib            39     48`,
    `     d  InpRcdFmt             49     58`,
    `     d Worktype        s             10    inz('*OUTQ')`,
    ``,
  ].join(`\n`);

  const parser = new Parser();
  const cache = await parser.getDocs(URI, lines);

  assert.strictEqual(cache.variables.length, 2, `Expect length of 2`);
  assert.strictEqual(cache.structs.length, 1, `Expect length of 1`);

  const InType = cache.find(`InType`);
  assert.strictEqual(InType.name, `InType`);
  assert.strictEqual(InType.position.line, 1);

  const Worktype = cache.variables[1];
  assert.strictEqual(Worktype.name, `Worktype`);
  assert.strictEqual(Worktype.position.line, 14);

  const InputDs = cache.structs[0];
  assert.strictEqual(InputDs.name, `InputDs`);
  assert.strictEqual(InputDs.position.line, 6);
  assert.strictEqual(InputDs.subItems.length, 7);
};

exports.fixed5 = async () => {
  const lines = [
    ``,
    `      *`,
    `      *  Field Definitions.`,
    `      *`,
    `     d UserSpaceOut    s             20`,
    `     d Worktype        s             10    inz('*OUTQ')`,
    ``,
    `      *`,
    `     d                 DS`,
    `     d  StartPosit             1      4B 0`,
    `     d  StartLen               5      8B 0`,
    `     d  SpaceLen               9     12B 0`,
    `     d  ReceiveLen            13     16B 0`,
    `     d  MessageKey            17     20B 0`,
    `     d  MsgDtaLen             21     24B 0`,
    `     d  MsgQueNbr             25     28B 0`,
    ``,
    `      *-- Retrieve object description:  -------------------------------`,
    `     d RtvObjD         Pr                  ExtPgm( 'QUSROBJD' )`,
    `     d  RoRcvVar                  32767a         Options( *VarSize )`,
    `     d  RoRcvVarLen                  10i 0 Const`,
    `     d  RoFmtNam                      8a   Const`,
    `     d  RoObjNamQ                    20a   Const`,
    `     d  RoObjTyp                     10a   Const`,
    `     d  RoError                   32767a         Options( *VarSize )`,
    ``,
    `      *`,
    `      * Date structure for retriving userspace info`,
    `      *`,
    `     d InputDs         DS`,
    `     d  UserSpace              1     20`,
    `     d  SpaceName              1     10`,
    `     d  SpaceLib              11     20`,
    `     d  InpFileLib            29     48`,
    `     d  InpFFilNam            29     38`,
    `     d  InpFFilLib            39     48`,
    `     d  InpRcdFmt             49     58`,
  ].join(`\n`);

  const parser = new Parser();
  const cache = await parser.getDocs(URI, lines);

  assert.strictEqual(cache.variables.length, 2, `Expect length of 2`);
  assert.strictEqual(cache.structs.length, 2, `Expect length of 2`);
  assert.strictEqual(cache.procedures.length, 1, `Expect length of 1`);

  const RtvObjD = cache.procedures[0];
  assert.strictEqual(RtvObjD.name, `RtvObjD`);
  assert.strictEqual(RtvObjD.position.line, 18);
  assert.strictEqual(RtvObjD.keywords.join(` `).trim(), `EXTPGM( 'QUSROBJD' )`);
  assert.strictEqual(RtvObjD.subItems.length, 6);
};

exports.fixed6 = async () => {
  const lines = [
    ``,
    `0.00 DDATE0            S               D                                             130124`,
    `2.00 DDATE1            S               D                                             130129`,
    `0.00 DDATE2            S               D   DATFMT(*JIS)                              130129`,
    `4.00 DDATE3            S               D   INZ(D'2001-01-12')                        130129`,
    `5.00 DDATE3_CHAR       S             10                                              130129`,
    `0.00 D len             S              5I 0                                           130130`,
    `6.00 DTIME0            S               T   INZ(T'10.12.15')                          130129`,
    `0.00 DTIME0_CHAR       S              8                                              130129`,
    ``,
  ].join(`\n`);

  const parser = new Parser();
  const cache = await parser.getDocs(URI, lines);

  assert.strictEqual(cache.variables.length, 8, `Expect length of 8`);

  const lenVar = cache.find(`len`);
  assert.strictEqual(lenVar.name, `len`);
  assert.strictEqual(lenVar.position.line, 6);
  assert.strictEqual(lenVar.keywords[0], `INT(5)`);

  const date2Var = cache.find(`DATE2`);
  assert.strictEqual(date2Var.name, `DATE2`);
  assert.strictEqual(date2Var.position.line, 3);
  assert.strictEqual(date2Var.keywords[0], `DATE`);
  assert.strictEqual(date2Var.keywords[1], `DATFMT(*JIS)`);

  const time0Var = cache.find(`TIME0`);
  assert.strictEqual(time0Var.name, `TIME0`);
  assert.strictEqual(time0Var.position.line, 7);
  assert.strictEqual(time0Var.keywords[0], `TIME`);
  assert.strictEqual(time0Var.keywords[1], `INZ(T'10.12.15')`);
};

exports.fixed7 = async () => {
  const lines = [
    ``,
    `       // -----------------------`,
    ``,
    `     P Obj_Next        B                   Export`,
    `     D Obj_Next        PI                  LikeDS(ObjectDs)`,
    ``,
    `      /Free`,
    `          $UserSpace( Userspace : StartPosit : StartLen : ObjectDs);`,
    `          StartPosit += SizeEntry;`,
    ``,
    `          Return ObjectDs;`,
    `      /End-Free`,
    ``,
    `     P                 E`,
    ``,
  ].join(`\n`);

  const parser = new Parser();
  const cache = await parser.getDocs(URI, lines);

  assert.strictEqual(cache.procedures.length, 1, `Expect length of 1`);

  const Obj_Next = cache.find(`Obj_Next`);
  assert.strictEqual(Obj_Next.name, `Obj_Next`);
  assert.strictEqual(Obj_Next.position.line, 3);
  assert.strictEqual(Obj_Next.keywords.includes(`EXPORT`), true);
  assert.strictEqual(Obj_Next.keywords.includes(`LIKEDS(OBJECTDS)`), true);
  assert.strictEqual(Obj_Next.subItems.length, 0);
};

exports.fixed8 = async () => {
  const lines = [
    ``,
    `      **========================================================================`,
    `      ** $QUSCRTUS - API to create user space`,
    `      **========================================================================`,
    `     c     $QUSCRTUS     begsr`,
    `      **`,
    `      ** Delete old space`,
    `      **`,
    `             system('DLTOBJ OBJ(QTEMP/MEMBERS) OBJTYPE(*USRSPC)');`,
    `      **`,
    `      ** Create a user space named ListMember in QTEMP.`,
    `      **`,
    `     c                   Eval      BytesPrv = 116`,
    `     c                   Eval      SpaceName = 'MEMBERS'`,
    `     c                   Eval      SpaceLib = 'QTEMP'`,
    `      **`,
    `      ** Create the user space`,
    `      **`,
    `     c                   call(e)   'QUSCRTUS'`,
    `     c                   parm      UserSpace     UserSpaceOut`,
    `     c                   parm                    SpaceAttr`,
    `     c                   parm      4096          SpaceLen`,
    `     c                   parm                    SpaceVal`,
    `     c                   parm                    SpaceAuth`,
    `     c                   parm                    SpaceText`,
    `     c                   parm                    SpaceRepl`,
    `     c                   parm                    ErrorDs`,
    `      **`,
    `     c                   endsr`,
    ``,
    `      **========================================================================`,
    `      ** $QUSLMBR  - API List all members in a file`,
    `      **========================================================================`,
    `     c     $QUSLMBR      begsr`,
    `      **`,
    `     c                   eval      nBufLen = %size(MbrD0100)`,
    `      **`,
    `     c                   call(e)   'QUSLMBR'`,
    `     c                   parm                    UserSpaceOut`,
    `     c                   parm                    Format`,
    `     c                   parm                    FileLib`,
    `     c                   parm                    AllMembers`,
    `     c                   parm                    bOvr`,
    `     c                   parm                    ErrorDs`,
    `      *`,
    `     c                   endsr`,
    ``,
  ].join(`\n`);

  const parser = new Parser();
  const cache = await parser.getDocs(URI, lines);

  assert.strictEqual(cache.subroutines.length, 2);
  assert.strictEqual(cache.subroutines[0].name, `$QUSCRTUS`);
  assert.strictEqual(cache.subroutines[1].name, `$QUSLMBR`);
};

exports.fixed9 = async () => {
  const lines = [
    ``,
    `       // -----------------------`,
    `      /copy './tests/rpgle/copy1.rpgle'`,
    `       // -----------------------`,
    ``,
    `     P Obj_Next        B                   Export`,
    `     D Obj_Next        PI                  LikeDS(ObjectDs)`,
    ``,
    `      /Free`,
    `          $UserSpace( Userspace : StartPosit : StartLen : ObjectDs);`,
    `          StartPosit += SizeEntry;`,
    ``,
    `          Return ObjectDs;`,
    `      /End-Free`,
    ``,
    `     P                 E`,
    ``,
  ].join(`\n`);

  const parser = new Parser();
  const cache = await parser.getDocs(URI, lines);

  assert.strictEqual(cache.procedures.length, 2);

  const Obj_Next = cache.find(`Obj_Next`);
  assert.strictEqual(Obj_Next.name, `Obj_Next`);
  assert.strictEqual(Obj_Next.position.line, 5);
  assert.strictEqual(Obj_Next.keywords.includes(`EXPORT`), true);
  assert.strictEqual(Obj_Next.keywords.includes(`LIKEDS(OBJECTDS)`), true);
  assert.strictEqual(Obj_Next.subItems.length, 0);

  const theExtProcedure = cache.find(`theExtProcedure`);
  assert.strictEqual(theExtProcedure.name, `theExtProcedure`);
  assert.strictEqual(theExtProcedure.position.line, 2);
  assert.strictEqual(theExtProcedure.keywords.includes(`EXTPROC`), true);
  assert.strictEqual(theExtProcedure.subItems.length, 1);
};

/**
   * Issue with detecting correct type on subfield.
   */
exports.fixed10 = async () => {
  const lines = [
    `     d  data           ds                  inz`,
    `     d   arid                         6`,
    `     d   ardesc                      50`,
    `     d   artifa                       3`,
    `     d   arsalePr                     7  2`,
    `     d act             c                   'act'`,
    `     D rrn02           s              7  2`,
    ``,
    `         return;`,
  ].join(`\n`);

  const parser = new Parser();
  const cache = await parser.getDocs(URI, lines);

  const dataDs = cache.find(`data`);
  assert.strictEqual(dataDs.name, `data`);
  assert.strictEqual(dataDs.subItems.length, 4);

  const rrn02 = cache.find(`rrn02`);
  assert.strictEqual(rrn02.name, `rrn02`);
  assert.strictEqual(rrn02.keywords.includes(`PACKED(7:2)`), true);

  const arsalePr = dataDs.subItems[3];
  assert.strictEqual(arsalePr.name, `arsalePr`);
  assert.strictEqual(arsalePr.keywords.includes(`ZONED(7:2)`), true);
};

exports.fixedfree1 = async () => {
  const lines = [
    `      *  Field Definitions.`,
    `      * ~~~~~~~~~~~~~~~~~~~~~~~~`,
    `     D ObjNam          s             10a`,
    `     D ObjLib          s             10a`,
    `     D ObjTyp          s             10a`,
    ``,
    `     P Obj_List        B                   Export`,
    `     D Obj_List        PI`,
    `     D    pLibrary                   10A   Const`,
    `     D    pObject                    10A   Const`,
    `     D    pType                      10A   Const`,
    `     D Result          s              5i 0`,
    ``,
    `      /Free`,
    ``,
    `          exsr $QUSCRTUS;`,
    `          ObjectLib =  pObject + pLibrary;`,
    `          WorkType = pType;`,
    ``,
    `          Format = 'OBJL0200';`,
    `          $ListObjects( Userspace : Format : ObjectLib : WorkType);`,
    `          //`,
    `          // Retrive header entry and process the user space`,
    `          //`,
    `          StartPosit = 125;`,
    `          StartLen   = 16;`,
    `          $UserSpace( Userspace : StartPosit : StartLen : GENDS);`,
    ``,
    `          StartPosit = OffsetHdr + 1;`,
    `          StartLen = %size(ObjectDS);`,
    ``,
    `          Return;`,
    ``,
    `          //--------------------------------------------------------`,
    `          // $QUSCRTUS - create userspace`,
    `          //--------------------------------------------------------`,
    `          begsr $QUSCRTUS;`,
    ``,
    `             system('DLTOBJ OBJ(QTEMP/LISTOUTQS) OBJTYPE(*USRSPC)');`,
    ``,
    `             BytesPrv = 116;`,
    `             Spacename = 'LISTOUTQS';`,
    `             SpaceLib = 'QTEMP';`,
    ``,
    `             // Create the user space`,
    `             $CreateSpace( Userspace : SpaceAttr : 4096 :`,
    `                           SpaceVal : SpaceAuth : SpaceText : SpaceRepl:`,
    `                           ErrorDs);`,
    `          endsr;`,
    `      /End-Free`,
    `     P                 E`,
    ``,
  ].join(`\n`);

  const parser = new Parser();
  const cache = await parser.getDocs(URI, lines);

  assert.strictEqual(cache.variables.length, 3);
  assert.strictEqual(cache.variables.find(i => !i.keywords.includes(`CHAR(10)`)), undefined);

  assert.strictEqual(cache.subroutines.length, 0);

  assert.strictEqual(cache.procedures.length, 1);
    
  const Obj_List = cache.find(`Obj_List`);
  assert.strictEqual(Obj_List.name, `Obj_List`);
  assert.strictEqual(Obj_List.position.line, 6);
  assert.strictEqual(Obj_List.keywords.includes(`EXPORT`), true);
  assert.strictEqual(Obj_List.subItems.length, 3);

  assert.strictEqual(Obj_List.subItems.find(i => !i.keywords.includes(`CHAR(10)`)), undefined);
  assert.strictEqual(Obj_List.subItems.find(i => !i.keywords.includes(`CONST`)), undefined);

  const scope = Obj_List.scope;
  assert.strictEqual(scope.subroutines.length, 1);
  assert.strictEqual(scope.variables.length, 1);
};

exports.fixed11 = async () => {
  const lines = [
    `     D F4DATE          PR`,
    `     D                                1`,
    `     D                               15`,
    `     D                                6    OPTIONS(*NOPASS)`,
    `     D                                1    OPTIONS(*NOPASS)`,
    `      `,
    `     D F4DATEDS        DS                  QUALIFIED`,
    `     D  IOF                           1A`,
    `     D  DATE15A                      15A`,
    `     D  FORMAT                        6A`,
    `     D  VIEW                          1A`,
  ].join(`\n`);

  const parser = new Parser();
  const cache = await parser.getDocs(URI, lines);

  const F4DATE = cache.find(`F4DATE`);
  assert.strictEqual(F4DATE.subItems.length, 4);

  const parm1 = F4DATE.subItems[0];
  assert.strictEqual(parm1.keywords[0], `CHAR(1)`);

  const parm2 = F4DATE.subItems[1];
  assert.strictEqual(parm2.keywords[0], `CHAR(15)`);

  const parm3 = F4DATE.subItems[2];
  assert.strictEqual(parm3.keywords[0], `CHAR(6)`);
  assert.strictEqual(parm3.keywords[1], `OPTIONS(*NOPASS)`);

  const parm4 = F4DATE.subItems[3];
  assert.strictEqual(parm4.keywords[0], `CHAR(1)`);
  assert.strictEqual(parm4.keywords[1], `OPTIONS(*NOPASS)`);
};

exports.columnFix = async () => {
  const lines = [
    `       Dcl-pr abcd1         Extpgm('ABC049');`,
    `         ParentProductSearch           zoned(11);`,
    `         AllowSelect                   char(1)   Options(*nopass);`,
    `         ReturnItemNumber              zoned(7)  Options(*nopass);`,
    `       end-pr;`,
    `       dcl-pr abcd2    extpgm('ABC039');`,
    `         SelectFlag                  char(1);`,
    `         ReturnProduct               zoned(7);`,
    `         SupplierFilter              zoned(3) options(*nopass);`,
    `         DescriptionFilter           char(20) Options(*nopass);`,
    `       end-pr;`,
    `       dcl-pr abcd3      extpgm('ABC001');`,
    `         ProductZoned                  Zoned(7);`,
    `       end-pr;`,
  ].join(`\n`);

  const parser = new Parser();
  const cache = await parser.getDocs(URI, lines);

  assert.strictEqual(cache.procedures.length, 3);
};

exports.comments1 = async () => {
  const lines = [
    `       //=== Prototypes for SRV_MSG routines ========================`,
    `       //============================================================`,
    `     D SndMsgPgmQ      pr                                                       Send Msg to PGM Q`,
    `     D  pMsgQ                        10`,
    `     D  pMsgid                        7`,
    `     D  pMsgFile                     10`,
    `     D  pMsgDta                     512    options(*NOPASS)`,
    `     D                                     Varying`,
    `       //============================================================`,
    `     D ClrMsgPgmQ      pr              N                                        Clear PGM Msg Q`,
    `     D pPgmMsgQ                      10`,
    ``,
    `       //============================================================`,
    `     D SndEscMsg       pr                                                       Send ESC Msg`,
    `     D piMsg                        512a   Const Varying`,
    ``,
    `       //============================================================`,
    `     D SndInfMsg       pr                                                       Send INF Msg`,
    `     D piMsg                        512a   Const Varying`,
    ``,
    `       //============================================================`,
    `     D JobLogMsg       Pr`,
    `     D piMsg                        512a   Value Varying                        Msg to job log`,
    ``,
    `       //============================================================`,
    `     D Show            pr                  extpgm('SHOW')                       Show popup msg`,
    `     D piPext                      8192a   Const Varying`,
    `     D piMsgId                        7a   Const options(*NOPASS)`,
    `     d piMsgFile                     21a   Const options(*NOPASS)`,
    ``,
    ``,
    `       //=== End of Prototypes forSRV_MSG Routines ==================`,
    ``,
  ].join(`\n`);

  const parser = new Parser();
  const cache = await parser.getDocs(URI, lines);

  assert.strictEqual(cache.procedures.length, 6);

  const SndMsgPgmQ = cache.find(`SndMsgPgmQ`);
  assert.strictEqual(SndMsgPgmQ.subItems.length, 4);

  const ClrMsgPgmQ = cache.find(`ClrMsgPgmQ`);
  assert.strictEqual(ClrMsgPgmQ.subItems.length, 1);

  const SndEscMsg = cache.find(`SndEscMsg`);
  assert.strictEqual(SndEscMsg.subItems.length, 1);

  const SndInfMsg = cache.find(`SndInfMsg`);
  assert.strictEqual(SndInfMsg.subItems.length, 1);

  const JobLogMsg = cache.find(`JobLogMsg`);
  assert.strictEqual(JobLogMsg.subItems.length, 1);

  const Show = cache.find(`Show`);
  assert.strictEqual(Show.subItems.length, 3);
};