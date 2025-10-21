import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
// import {data} from '../../assets/country/'
@Injectable({
  providedIn: 'root',
})
export class CountryServiceService {
  countryDropdown = [
    {
      country: 'Afghanistan',
      isd_code: '+93',
      flag_url: 'assets/country/af.png',
    },
    {
      country: 'Albania',
      isd_code: '+355',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/al.svg',
    },
    {
      country: 'Algeria',
      isd_code: '+213',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/dz.svg',
    },
    {
      country: 'Andorra',
      isd_code: '+376',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ad.svg',
    },
    {
      country: 'Angola',
      isd_code: '+244',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ao.svg',
    },
    {
      country: 'Argentina',
      isd_code: '+54',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ar.svg',
    },
    {
      country: 'Armenia',
      isd_code: '+374',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/am.svg',
    },
    {
      country: 'Australia',
      isd_code: '+61',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/au.svg',
    },
    {
      country: 'Austria',
      isd_code: '+43',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/at.svg',
    },
    {
      country: 'Azerbaijan',
      isd_code: '+994',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/az.svg',
    },
    {
      country: 'Bahamas',
      isd_code: '+1-242',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/bs.svg',
    },
    {
      country: 'Bahrain',
      isd_code: '+973',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/bh.svg',
    },
    {
      country: 'Bangladesh',
      isd_code: '+880',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/bd.svg',
    },
    {
      country: 'Barbados',
      isd_code: '+1-246',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/bb.svg',
    },
    {
      country: 'Belarus',
      isd_code: '+375',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/by.svg',
    },
    {
      country: 'Belgium',
      isd_code: '+32',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/be.svg',
    },
    {
      country: 'Belize',
      isd_code: '+501',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/bz.svg',
    },
    {
      country: 'Benin',
      isd_code: '+229',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/bj.svg',
    },
    {
      country: 'Bhutan',
      isd_code: '+975',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/bt.svg',
    },
    {
      country: 'Bolivia',
      isd_code: '+591',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/bo.svg',
    },
    {
      country: 'Bosnia and Herzegovina',
      isd_code: '+387',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ba.svg',
    },
    {
      country: 'Botswana',
      isd_code: '+267',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/bw.svg',
    },
    {
      country: 'Brazil',
      isd_code: '+55',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/br.svg',
    },
    {
      country: 'Brunei',
      isd_code: '+673',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/bn.svg',
    },
    {
      country: 'Bulgaria',
      isd_code: '+359',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/bg.svg',
    },
    {
      country: 'Burkina Faso',
      isd_code: '+226',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/bf.svg',
    },
    {
      country: 'Burundi',
      isd_code: '+257',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/bi.svg',
    },
    {
      country: 'Cabo Verde',
      isd_code: '+238',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/cv.svg',
    },
    {
      country: 'Cambodia',
      isd_code: '+855',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/kh.svg',
    },
    {
      country: 'Cameroon',
      isd_code: '+237',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/cm.svg',
    },
    {
      country: 'Canada',
      isd_code: '+1',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ca.svg',
    },
    {
      country: 'Central African Republic',
      isd_code: '+236',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/cf.svg',
    },
    {
      country: 'Chad',
      isd_code: '+235',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/td.svg',
    },
    {
      country: 'Chile',
      isd_code: '+56',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/cl.svg',
    },
    {
      country: 'China',
      isd_code: '+86',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/cn.svg',
    },
    {
      country: 'Colombia',
      isd_code: '+57',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/co.svg',
    },
    {
      country: 'Comoros',
      isd_code: '+269',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/km.svg',
    },
    {
      country: 'Congo (Congo-Brazzaville)',
      isd_code: '+242',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/cg.svg',
    },
    {
      country: 'Costa Rica',
      isd_code: '+506',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/cr.svg',
    },
    {
      country: 'Croatia',
      isd_code: '+385',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/hr.svg',
    },
    {
      country: 'Cuba',
      isd_code: '+53',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/cu.svg',
    },
    {
      country: 'Cyprus',
      isd_code: '+357',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/cy.svg',
    },
    {
      country: 'Czech Republic',
      isd_code: '+420',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/cz.svg',
    },
    {
      country: 'Democratic Republic of the Congo',
      isd_code: '+243',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/cd.svg',
    },
    {
      country: 'Denmark',
      isd_code: '+45',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/dk.svg',
    },
    {
      country: 'Djibouti',
      isd_code: '+253',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/dj.svg',
    },
    {
      country: 'Dominica',
      isd_code: '+1-767',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/dm.svg',
    },
    {
      country: 'Dominican Republic',
      isd_code: '+1-809',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/do.svg',
    },
    {
      country: 'Ecuador',
      isd_code: '+593',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ec.svg',
    },
    {
      country: 'Egypt',
      isd_code: '+20',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/eg.svg',
    },
    {
      country: 'El Salvador',
      isd_code: '+503',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/sv.svg',
    },
    {
      country: 'Equatorial Guinea',
      isd_code: '+240',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/gq.svg',
    },
    {
      country: 'Eritrea',
      isd_code: '+291',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/er.svg',
    },
    {
      country: 'Estonia',
      isd_code: '+372',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ee.svg',
    },
    {
      country: 'Eswatini',
      isd_code: '+268',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/sz.svg',
    },
    {
      country: 'Ethiopia',
      isd_code: '+251',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/et.svg',
    },
    {
      country: 'Fiji',
      isd_code: '+679',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/fj.svg',
    },
    {
      country: 'Finland',
      isd_code: '+358',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/fi.svg',
    },
    {
      country: 'France',
      isd_code: '+33',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/fr.svg',
    },
    {
      country: 'Gabon',
      isd_code: '+241',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ga.svg',
    },
    {
      country: 'Gambia',
      isd_code: '+220',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/gm.svg',
    },
    {
      country: 'Georgia',
      isd_code: '+995',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ge.svg',
    },
    {
      country: 'Germany',
      isd_code: '+49',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/de.svg',
    },
    {
      country: 'Ghana',
      isd_code: '+233',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/gh.svg',
    },
    {
      country: 'Greece',
      isd_code: '+30',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/gr.svg',
    },
    {
      country: 'Grenada',
      isd_code: '+1-473',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/gd.svg',
    },
    {
      country: 'Guatemala',
      isd_code: '+502',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/gt.svg',
    },
    {
      country: 'Guinea',
      isd_code: '+224',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/gn.svg',
    },
    {
      country: 'Guinea-Bissau',
      isd_code: '+245',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/gw.svg',
    },
    {
      country: 'Guyana',
      isd_code: '+592',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/gy.svg',
    },
    {
      country: 'Haiti',
      isd_code: '+509',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ht.svg',
    },
    {
      country: 'Honduras',
      isd_code: '+504',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/hn.svg',
    },
    {
      country: 'Hungary',
      isd_code: '+36',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/hu.svg',
    },
    {
      country: 'Iceland',
      isd_code: '+354',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/is.svg',
    },
    {
      country: 'India',
      isd_code: '+91',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/in.svg',
    },
    {
      country: 'Indonesia',
      isd_code: '+62',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/id.svg',
    },
    {
      country: 'Iran',
      isd_code: '+98',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ir.svg',
    },
    {
      country: 'Iraq',
      isd_code: '+964',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/iq.svg',
    },
    {
      country: 'Ireland',
      isd_code: '+353',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ie.svg',
    },
    {
      country: 'Israel',
      isd_code: '+972',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/il.svg',
    },
    {
      country: 'Italy',
      isd_code: '+39',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/it.svg',
    },
    {
      country: 'Jamaica',
      isd_code: '+1-876',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/jm.svg',
    },
    {
      country: 'Japan',
      isd_code: '+81',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/jp.svg',
    },
    {
      country: 'Jordan',
      isd_code: '+962',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/jo.svg',
    },
    {
      country: 'Kazakhstan',
      isd_code: '+7',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/kz.svg',
    },
    {
      country: 'Kenya',
      isd_code: '+254',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ke.svg',
    },
    {
      country: 'Kiribati',
      isd_code: '+686',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ki.svg',
    },
    {
      country: 'Kuwait',
      isd_code: '+965',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/kw.svg',
    },
    {
      country: 'Kyrgyzstan',
      isd_code: '+996',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/kg.svg',
    },
    {
      country: 'Laos',
      isd_code: '+856',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/la.svg',
    },
    {
      country: 'Latvia',
      isd_code: '+371',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/lv.svg',
    },
    {
      country: 'Lebanon',
      isd_code: '+961',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/lb.svg',
    },
    {
      country: 'Lesotho',
      isd_code: '+266',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ls.svg',
    },
    {
      country: 'Liberia',
      isd_code: '+231',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/lr.svg',
    },
    {
      country: 'Libya',
      isd_code: '+218',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ly.svg',
    },
    {
      country: 'Liechtenstein',
      isd_code: '+423',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/li.svg',
    },
    {
      country: 'Lithuania',
      isd_code: '+370',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/lt.svg',
    },
    {
      country: 'Luxembourg',
      isd_code: '+352',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/lu.svg',
    },
    {
      country: 'Madagascar',
      isd_code: '+261',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/mg.svg',
    },
    {
      country: 'Malawi',
      isd_code: '+265',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/mw.svg',
    },
    {
      country: 'Malaysia',
      isd_code: '+60',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/my.svg',
    },
    {
      country: 'Maldives',
      isd_code: '+960',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/mv.svg',
    },
    {
      country: 'Mali',
      isd_code: '+223',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ml.svg',
    },
    {
      country: 'Malta',
      isd_code: '+356',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/mt.svg',
    },
    {
      country: 'Marshall Islands',
      isd_code: '+692',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/mh.svg',
    },
    {
      country: 'Mauritania',
      isd_code: '+222',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/mr.svg',
    },
    {
      country: 'Mauritius',
      isd_code: '+230',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/mu.svg',
    },
    {
      country: 'Mexico',
      isd_code: '+52',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/mx.svg',
    },
    {
      country: 'Micronesia',
      isd_code: '+691',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/fm.svg',
    },
    {
      country: 'Moldova',
      isd_code: '+373',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/md.svg',
    },
    {
      country: 'Monaco',
      isd_code: '+377',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/mc.svg',
    },
    {
      country: 'Mongolia',
      isd_code: '+976',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/mn.svg',
    },
    {
      country: 'Montenegro',
      isd_code: '+382',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/me.svg',
    },
    {
      country: 'Morocco',
      isd_code: '+212',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ma.svg',
    },
    {
      country: 'Mozambique',
      isd_code: '+258',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/mz.svg',
    },
    {
      country: 'Myanmar',
      isd_code: '+95',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/mm.svg',
    },
    {
      country: 'Namibia',
      isd_code: '+264',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/na.svg',
    },
    {
      country: 'Nauru',
      isd_code: '+674',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/nr.svg',
    },
    {
      country: 'Nepal',
      isd_code: '+977',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/np.svg',
    },
    {
      country: 'Netherlands',
      isd_code: '+31',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/nl.svg',
    },
    {
      country: 'New Zealand',
      isd_code: '+64',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/nz.svg',
    },
    {
      country: 'Nicaragua',
      isd_code: '+505',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ni.svg',
    },
    {
      country: 'Niger',
      isd_code: '+227',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ne.svg',
    },
    {
      country: 'Nigeria',
      isd_code: '+234',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ng.svg',
    },
    {
      country: 'North Korea',
      isd_code: '+850',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/kp.svg',
    },
    {
      country: 'North Macedonia',
      isd_code: '+389',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/mk.svg',
    },
    {
      country: 'Norway',
      isd_code: '+47',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/no.svg',
    },
    {
      country: 'Oman',
      isd_code: '+968',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/om.svg',
    },
    {
      country: 'Pakistan',
      isd_code: '+92',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/pk.svg',
    },
    {
      country: 'Palau',
      isd_code: '+680',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/pw.svg',
    },
    {
      country: 'Palestine',
      isd_code: '+970',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ps.svg',
    },
    {
      country: 'Panama',
      isd_code: '+507',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/pa.svg',
    },
    {
      country: 'Papua New Guinea',
      isd_code: '+675',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/pg.svg',
    },
    {
      country: 'Paraguay',
      isd_code: '+595',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/py.svg',
    },
    {
      country: 'Peru',
      isd_code: '+51',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/pe.svg',
    },
    {
      country: 'Philippines',
      isd_code: '+63',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ph.svg',
    },
    {
      country: 'Poland',
      isd_code: '+48',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/pl.svg',
    },
    {
      country: 'Portugal',
      isd_code: '+351',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/pt.svg',
    },
    {
      country: 'Qatar',
      isd_code: '+974',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/qa.svg',
    },
    {
      country: 'Romania',
      isd_code: '+40',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ro.svg',
    },
    {
      country: 'Russia',
      isd_code: '+7',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ru.svg',
    },
    {
      country: 'Rwanda',
      isd_code: '+250',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/rw.svg',
    },
    {
      country: 'Saint Kitts and Nevis',
      isd_code: '+1-869',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/kn.svg',
    },
    {
      country: 'Saint Lucia',
      isd_code: '+1-758',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/lc.svg',
    },
    {
      country: 'Saint Vincent and the Grenadines',
      isd_code: '+1-784',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/vc.svg',
    },
    {
      country: 'Samoa',
      isd_code: '+685',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ws.svg',
    },
    {
      country: 'San Marino',
      isd_code: '+378',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/sm.svg',
    },
    {
      country: 'Sao Tome and Principe',
      isd_code: '+239',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/st.svg',
    },
    {
      country: 'Saudi Arabia',
      isd_code: '+966',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/sa.svg',
    },
    {
      country: 'Senegal',
      isd_code: '+221',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/sn.svg',
    },
    {
      country: 'Serbia',
      isd_code: '+381',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/rs.svg',
    },
    {
      country: 'Seychelles',
      isd_code: '+248',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/sc.svg',
    },
    {
      country: 'Sierra Leone',
      isd_code: '+232',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/sl.svg',
    },
    {
      country: 'Singapore',
      isd_code: '+65',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/sg.svg',
    },
    {
      country: 'Slovakia',
      isd_code: '+421',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/sk.svg',
    },
    {
      country: 'Slovenia',
      isd_code: '+386',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/si.svg',
    },
    {
      country: 'Solomon Islands',
      isd_code: '+677',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/sb.svg',
    },
    {
      country: 'Somalia',
      isd_code: '+252',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/so.svg',
    },
    {
      country: 'South Africa',
      isd_code: '+27',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/za.svg',
    },
    {
      country: 'South Korea',
      isd_code: '+82',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/kr.svg',
    },
    {
      country: 'South Sudan',
      isd_code: '+211',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ss.svg',
    },
    {
      country: 'Spain',
      isd_code: '+34',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/es.svg',
    },
    {
      country: 'Sri Lanka',
      isd_code: '+94',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/lk.svg',
    },
    {
      country: 'Sudan',
      isd_code: '+249',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/sd.svg',
    },
    {
      country: 'Suriname',
      isd_code: '+597',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/sr.svg',
    },
    {
      country: 'Sweden',
      isd_code: '+46',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/se.svg',
    },
    {
      country: 'Switzerland',
      isd_code: '+41',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ch.svg',
    },
    {
      country: 'Syria',
      isd_code: '+963',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/sy.svg',
    },
    {
      country: 'Taiwan',
      isd_code: '+886',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/tw.svg',
    },
    {
      country: 'Tajikistan',
      isd_code: '+992',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/tj.svg',
    },
    {
      country: 'Tanzania',
      isd_code: '+255',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/tz.svg',
    },
    {
      country: 'Thailand',
      isd_code: '+66',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/th.svg',
    },
    {
      country: 'Timor-Leste',
      isd_code: '+670',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/tl.svg',
    },
    {
      country: 'Togo',
      isd_code: '+228',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/tg.svg',
    },
    {
      country: 'Tonga',
      isd_code: '+676',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/to.svg',
    },
    {
      country: 'Trinidad and Tobago',
      isd_code: '+1-868',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/tt.svg',
    },
    {
      country: 'Tunisia',
      isd_code: '+216',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/tn.svg',
    },
    {
      country: 'Turkey',
      isd_code: '+90',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/tr.svg',
    },
    {
      country: 'Turkmenistan',
      isd_code: '+993',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/tm.svg',
    },
    {
      country: 'Tuvalu',
      isd_code: '+688',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/tv.svg',
    },
    {
      country: 'Uganda',
      isd_code: '+256',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ug.svg',
    },
    {
      country: 'Ukraine',
      isd_code: '+380',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ua.svg',
    },
    {
      country: 'United Arab Emirates',
      isd_code: '+971',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ae.svg',
    },
    {
      country: 'United Kingdom',
      isd_code: '+44',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/gb.svg',
    },
    {
      country: 'United States',
      isd_code: '+1',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/us.svg',
    },
    {
      country: 'Uruguay',
      isd_code: '+598',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/uy.svg',
    },
    {
      country: 'Uzbekistan',
      isd_code: '+998',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/uz.svg',
    },
    {
      country: 'Vanuatu',
      isd_code: '+678',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/vu.svg',
    },
    {
      country: 'Vatican City',
      isd_code: '+39',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/va.svg',
    },
    {
      country: 'Venezuela',
      isd_code: '+58',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ve.svg',
    },
    {
      country: 'Vietnam',
      isd_code: '+84',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/vn.svg',
    },
    {
      country: 'Yemen',
      isd_code: '+967',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/ye.svg',
    },
    {
      country: 'Zambia',
      isd_code: '+260',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/zm.svg',
    },
    {
      country: 'Zimbabwe',
      isd_code: '+263',
      flag_url:
        'Project/VeztaRetail/src/assets/country/country-code.json/zw.svg',
    },
  ];
  private jsonUrl = 'assets/country/country-data.json';
  constructor(private http: HttpClient) {}

  getCountryList(): Observable<any[]> {
    return this.http.get<any[]>(this.jsonUrl);
  }
}
