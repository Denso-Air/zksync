import { ArgumentParser } from 'argparse';
import * as fs from 'fs';
import * as path from 'path';
import { deployContract } from 'ethereum-waffle';
import { Wallet } from 'ethers';

const provider = new ethers.providers.JsonRpcProvider(process.env.ETH_CLIENT_WEB3_URL);
const testConfigPath = path.join(process.env.ZKSYNC_HOME as string, `etc/test_config/constant`);
const ethTestConfig = JSON.parse(fs.readFileSync(`${testConfigPath}/eth.json`, { encoding: 'utf-8' }));

const MAX_CONTRACT_SIZE_BYTES = 24576;
async function main() {
    const parser = new ArgumentParser({
        version: '0.1.0',
        addHelp: true
    });
    parser.addArgument('--deployerPrivateKey', { required: false, help: 'Wallet used to deploy contracts' });
    const args = parser.parseArgs(process.argv.slice(2));

    const wallet = args.deployerPrivateKey
        ? new Wallet(args.deployerPrivateKey, provider)
        : Wallet.fromMnemonic(ethTestConfig.mnemonic, "m/44'/60'/0'/0/1").connect(provider);

    const verifierContractCode = require('../build/ConcreteVerifier.json');
    const verifier = await deployContract(wallet, verifierContractCode, [], {
        gasLimit: 3000000
    });
    console.log(`bytecode size ${verifierContractCode.bytecode.length / 2}/${MAX_CONTRACT_SIZE_BYTES}`);
    console.log('contract deployed: ', verifier.address);

    const pubInput = ['9366919236262480046626087110386428225440480409139203903479219191712040973482'];
    const serProof = [
        '4934250949535268430092530517250034144688855003728471623081612444699220355079',
        '5100956679220776569085889666961752182164922604414739407745419585445028476222',
        '7832176732467857667393190214847843171259421063364939528666778396551077622753',
        '7215440588644584749782594917216216178515500541730601341117551976925913593427',
        '10280499200207030502987158982643391987831946158500541661269659931677008030893',
        '17157233246495488827758140634254360456372250899201517343745761768634506512553',
        '12934196931266320861222953051568332201120592669192531204493314094357485994581',
        '907705324491009029084855915836782283360628937207329043068585753094552434103',
        '9113941492467285767490841115217393850935897934103733163284443333474542133383',
        '17737358643284021627248406480066755138683748854822579981231983622137234219833',
        '14630001264805718243478221889394799248652941815750318024526715923272733199826',
        '4398746009425314053741083733153677392155815349985119700402309903412362434029',
        '2002944897646164408489869573523937565795365606169922648964167127333203057894',
        '13230499798171668286583748521244509161774002322081644216332923063456011417939',
        '11918984496991661071787493709791488291989400678728744131533754575755511672105',
        '4845651378305950688147635015789777458804541468800773162949891926881057045392',
        '8224687960583745343562275371391725725851837844045920861712727523055007220587',
        '14785605474108447486637111031465682148215398760198932855485056463990784749086',
        '11359557146282014885975824413753146384654812828295427356882427128338143283227',
        '8526129901739278665272873988090555513051725715137010418154702403903547180914',
        '4659028839159392052491828856414782862732482218215768790440396172650276727525',
        '13179979723872396566754921025933910619416929626576107987657563641337759741682',
        '2418757712945962060038180063231228060804069279021733959350341519817685143829',
        '3979285927154373044917106662272058956587901854283305236668149560870955559159',
        '10521664143835369295555599820894299772193782312083618016495939854979335586198',
        '15060216479587697362427009716323348120704369062353403100917714944393462607051',
        '1698479328823934773599573217476653188543309878224277770121155688188078862276',
        '16721192335614475795114775233838152143306458652262796920502239696280450721588',
        '5119369907092257057207626770603048803706711713213228683183224378705609573302',
        '9210485388492158807967766757218473686198149017787993846809462045326010234119',
        '3130046766125413030949433429675708286822736036681723852733465914419926162503',
        '8168611167179145284642618458090594199290189777426699161534304528972766980671',
        '12584125175882553743495805715499797473991672366465285728421984275577853022084'
    ];
    const tx = await verifier.verify(pubInput, serProof);
    console.log('tx: ', tx.hash);
    const receipt = await tx.wait();
    console.log('gas used: ', receipt.gasUsed.toNumber());
}

main();
