import { route } from '../router.js';
import { antworte } from '../kontext.js';
import { entXml, escXml } from '../hilfen.js';
import { LAGER, PRODUKTE, produkt } from '../daten.js';

const NS = 'urn:mission-schnittstelle:lager';
const SOAP_NS = 'http://schemas.xmlsoap.org/soap/envelope/';
const XML_KOPF = { 'Content-Type': 'text/xml; charset=utf-8' };

function wsdl(adresse) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!--
  Das ist eine WSDL-Datei (Web Services Description Language).
  Sie ist der "Vertrag" eines SOAP-Dienstes und beschreibt:
    types    → welche Daten es gibt
    message  → welche Nachrichten verschickt werden
    portType → welche Operationen (Funktionen) der Dienst anbietet
    binding  → wie das technisch übertragen wird (SOAP über HTTP)
    service  → unter welcher Adresse der Dienst erreichbar ist
-->
<definitions name="LagerService"
    targetNamespace="${NS}"
    xmlns="http://schemas.xmlsoap.org/wsdl/"
    xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/"
    xmlns:tns="${NS}"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema">

  <types>
    <xsd:schema targetNamespace="${NS}" elementFormDefault="qualified">
      <xsd:element name="LagerbestandAbfragen">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="artikelnummer" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="LagerbestandAbfragenResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="artikelnummer" type="xsd:string"/>
            <xsd:element name="bezeichnung" type="xsd:string"/>
            <xsd:element name="bestand" type="xsd:int"/>
            <xsd:element name="lagerort" type="xsd:string"/>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="ArtikelAuflisten">
        <xsd:complexType>
          <xsd:sequence/>
        </xsd:complexType>
      </xsd:element>
      <xsd:element name="ArtikelAuflistenResponse">
        <xsd:complexType>
          <xsd:sequence>
            <xsd:element name="artikel" maxOccurs="unbounded">
              <xsd:complexType>
                <xsd:sequence>
                  <xsd:element name="artikelnummer" type="xsd:string"/>
                  <xsd:element name="bezeichnung" type="xsd:string"/>
                </xsd:sequence>
              </xsd:complexType>
            </xsd:element>
          </xsd:sequence>
        </xsd:complexType>
      </xsd:element>
    </xsd:schema>
  </types>

  <message name="LagerbestandAbfragenEingabe">
    <part name="parameters" element="tns:LagerbestandAbfragen"/>
  </message>
  <message name="LagerbestandAbfragenAusgabe">
    <part name="parameters" element="tns:LagerbestandAbfragenResponse"/>
  </message>
  <message name="ArtikelAuflistenEingabe">
    <part name="parameters" element="tns:ArtikelAuflisten"/>
  </message>
  <message name="ArtikelAuflistenAusgabe">
    <part name="parameters" element="tns:ArtikelAuflistenResponse"/>
  </message>

  <portType name="LagerPortType">
    <operation name="LagerbestandAbfragen">
      <documentation>Liefert den aktuellen Bestand eines Artikels.</documentation>
      <input message="tns:LagerbestandAbfragenEingabe"/>
      <output message="tns:LagerbestandAbfragenAusgabe"/>
    </operation>
    <operation name="ArtikelAuflisten">
      <documentation>Listet alle Artikel des Lagers auf.</documentation>
      <input message="tns:ArtikelAuflistenEingabe"/>
      <output message="tns:ArtikelAuflistenAusgabe"/>
    </operation>
  </portType>

  <binding name="LagerBinding" type="tns:LagerPortType">
    <soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>
    <operation name="LagerbestandAbfragen">
      <soap:operation soapAction="urn:LagerbestandAbfragen"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
    <operation name="ArtikelAuflisten">
      <soap:operation soapAction="urn:ArtikelAuflisten"/>
      <input><soap:body use="literal"/></input>
      <output><soap:body use="literal"/></output>
    </operation>
  </binding>

  <service name="LagerService">
    <documentation>Übungs-Lagerdienst von Mission Schnittstelle</documentation>
    <port name="LagerPort" binding="tns:LagerBinding">
      <soap:address location="${escXml(adresse)}"/>
    </port>
  </service>
</definitions>
`;
}

function umschlag(inhalt) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="${SOAP_NS}" xmlns:lag="${NS}">
  <soap:Body>
${inhalt}
  </soap:Body>
</soap:Envelope>
`;
}

function fault(code, text, hinweis) {
  return umschlag(`    <soap:Fault>
      <faultcode>soap:${code}</faultcode>
      <faultstring>${escXml(text)}</faultstring>${
        hinweis
          ? `
      <detail>
        <lag:hinweis>${escXml(hinweis)}</lag:hinweis>
      </detail>`
          : ''
      }
    </soap:Fault>`);
}

function adresseVon(ctx) {
  const proto = String(ctx.req.headers['x-forwarded-proto'] || '').split(',')[0] || (ctx.req.socket.encrypted ? 'https' : 'http');
  return `${proto}://${ctx.req.headers.host || 'localhost'}/soap/lager`;
}

function lagerGet(ctx) {
  const willWsdl = [...ctx.query.keys()].some((k) => k.toLowerCase() === 'wsdl');
  if (willWsdl) {
    ctx.spieler.erfolg('wsdl_gelesen');
    return antworte(ctx, 200, wsdl(adresseVon(ctx)), XML_KOPF);
  }
  return antworte(
    ctx,
    405,
    'Dies ist ein SOAP-Dienst. Er erwartet POST-Anfragen mit einem XML-Umschlag (Envelope).\n' +
      'Den Vertrag (WSDL) mit allen Operationen findest du unter: /soap/lager?wsdl\n',
    { Allow: 'POST', 'Content-Type': 'text/plain; charset=utf-8' },
  );
}

const elementInhalt = (xml, name) =>
  xml.match(new RegExp(`<(?:[\\w-]+:)?${name}\\b[^>]*>([\\s\\S]*?)</(?:[\\w-]+:)?${name}\\s*>`))?.[1];

async function lagerPost(ctx) {
  const typ = String(ctx.req.headers['content-type'] || '').toLowerCase();
  if (!typ.includes('xml')) {
    return antworte(
      ctx,
      415,
      fault(
        'Client',
        `Falscher Content-Type "${typ || '(keiner)'}". SOAP-Nachrichten sind XML.`,
        'Setze den Header Content-Type: text/xml; charset=utf-8',
      ),
      XML_KOPF,
    );
  }
  const xml = await ctx.text();
  if (!/<(?:[\w-]+:)?Envelope\b/.test(xml)) {
    ctx.spieler.erfolg('soap_fault');
    return antworte(ctx, 500, fault('Client', 'Kein SOAP-Envelope gefunden.', 'Jede SOAP-Nachricht steckt in <soap:Envelope> … </soap:Envelope>.'), XML_KOPF);
  }
  const body = elementInhalt(xml, 'Body');
  if (body === undefined) {
    ctx.spieler.erfolg('soap_fault');
    return antworte(ctx, 500, fault('Client', 'Kein SOAP-Body gefunden.', 'Die eigentliche Anfrage gehört in <soap:Body> … </soap:Body>.'), XML_KOPF);
  }
  const operation = body.replace(/<!--[\s\S]*?-->/g, '').match(/<(?:[\w-]+:)?([\w-]+)\b[^>]*?\/?>/)?.[1];

  if (operation === 'ArtikelAuflisten') {
    ctx.spieler.erfolg('soap_anfrage');
    const artikel = PRODUKTE.map(
      (p) => `      <lag:artikel>
        <lag:artikelnummer>${p.artikelnummer}</lag:artikelnummer>
        <lag:bezeichnung>${escXml(p.name)}</lag:bezeichnung>
      </lag:artikel>`,
    ).join('\n');
    return antworte(ctx, 200, umschlag(`    <lag:ArtikelAuflistenResponse>\n${artikel}\n    </lag:ArtikelAuflistenResponse>`), XML_KOPF);
  }

  if (operation !== 'LagerbestandAbfragen') {
    ctx.spieler.erfolg('soap_fault');
    return antworte(
      ctx,
      500,
      fault('Client', `Unbekannte Operation "${operation ?? '(leer)'}".`, 'Verfügbare Operationen: LagerbestandAbfragen, ArtikelAuflisten (siehe WSDL)'),
      XML_KOPF,
    );
  }

  const nummer = entXml(elementInhalt(body, 'artikelnummer') ?? '').trim();
  if (!nummer) {
    ctx.spieler.erfolg('soap_fault');
    return antworte(ctx, 500, fault('Client', 'Das Element <artikelnummer> fehlt oder ist leer.'), XML_KOPF);
  }
  const p = produkt(nummer);
  if (!p) {
    ctx.spieler.erfolg('soap_fault');
    return antworte(ctx, 500, fault('Client', `Artikel ${nummer} ist unbekannt.`, 'Gültige Artikelnummern: A-1001 bis A-1008'), XML_KOPF);
  }

  ctx.spieler.erfolg('soap_anfrage');
  const auftrag = ctx.spieler.auftrag;
  if (auftrag && auftrag.artikelnummer === p.artikelnummer) {
    auftrag.lagerGeprueft = true;
    ctx.spieler.erfolg('auftrag_lager_geprueft');
  }
  const lager = LAGER[p.artikelnummer];
  return antworte(
    ctx,
    200,
    umschlag(`    <lag:LagerbestandAbfragenResponse>
      <lag:artikelnummer>${p.artikelnummer}</lag:artikelnummer>
      <lag:bezeichnung>${escXml(p.name)}</lag:bezeichnung>
      <lag:bestand>${lager.bestand}</lag:bestand>
      <lag:lagerort>${escXml(lager.lagerort)}</lag:lagerort>
    </lag:LagerbestandAbfragenResponse>`),
    XML_KOPF,
  );
}

export default [route('GET', '/soap/lager', lagerGet), route('POST', '/soap/lager', lagerPost)];
