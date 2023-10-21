import React from 'react';
import { makeButton } from './reactComponents/Button';
import { screenshotsDiv } from './screenshotsPage';
import { Navbar } from 'react-bootstrap';
import { ViewType, homeView } from '../localization/stringConstants';

import FinKittyCat from './cat.png';
import WaitGif from './catWait.gif';
import { log, printDebug } from '../utils/utils';
import Image from 'next/image'
import { getAppVersion } from '../utils/appVersion';

export function navbarContent(
  isWaiting: boolean, 
  rhContent: () => any,
  toggle: (
    type: ViewType,
    refreshModel: boolean,
    refreshChart: boolean,
    sourceID: number,
  ) => void | boolean,
) {
  /* istanbul ignore if  */
  if (printDebug()) {
    log(`drawing navbar content`);
  }
  // log(`drawing navbar content; isWaiting = ${isWaiting}`);
  const variantString = 'light';

  // Toggle this if you need a visual indicator of change
  const bgString = 'light';
  //  const bgString = "primary";

  return (
    <Navbar expand="lg" bg={bgString} variant={variantString} sticky="top">
      <Navbar.Brand href="#home" id="finkitty-brand">
        <Image
          src={isWaiting ? WaitGif : FinKittyCat}
          alt="FinKitty cat"
          width={70}
          onClick={() => {
            toggle(
              homeView,
              false, // refreshModel
              false, // refreshChart
              6, //call
            );
          }}
          id="btn-Home"
        />
      </Navbar.Brand>
      {rhContent()}
    </Navbar>
  );
}

export function loginPage(loginWithRedirect: any, loginForTesting: any) {
  return (
    <>
      {navbarContent(
        false, // is not waiting
        () => {
          return (
            <h3>An app for financial kitty forecasting v{getAppVersion()}</h3>
          );
        },
        (
          type: ViewType,
          refreshModel: boolean,
          refreshChart: boolean,
          sourceID: number,
        ) => {
          // do nothing!
        },        
      )}
      <div className="row">
        <div className="col-sm mb-4">
          <div className="alert alert-block">
            <h2>Get started</h2> To begin using this app, log in or use a shared
            playpen
            <br />
            {makeButton(
              'Login or create an account',
              loginWithRedirect,
              'buttonLogin',
              'buttonLogin',
              'outline-secondary',
            )}
            {makeButton(
              'Shared playpen (no login)',
              loginForTesting,
              'buttonTestLogin',
              'buttonTestLogin',
              'outline-secondary',
            )}
          </div>
          <div className="alert alert-block">
            <strong>How it works</strong> Build one or more models. Each tracks
            the financial progress of one possible world, based on information
            you provide for that model, about expenses, incomes, assets and
            transactions. You can log out and come back another time and your
            models will still be available for you to explore. For each model,
            an overview page can be printed to PDF as a take-away customisable
            report, which can include all the data you have provided to build up
            the model.
          </div>
          <div className="alert alert-block">
            <strong>Data security</strong> Access to the app is controlled by
            user authentication. Web communication uses secure HTTPS protocols
            and model data is encypted using industry-standard algorithms before
            it is stored in a database on the cloud. You can extract all your
            data in readable JSON text format if you choose to delete your data
            from this system. For the moment, the database and server are build
            without additional levels of health checks and full resilience. If
            you need guaranteed access to your data, a backup download of the
            JSON data and a record of the PDF overview are advised.
          </div>
          <div className="alert alert-block">
            <strong>Modeling tax</strong> Income tax is calculated according to
            UK tax regulations as at October 2022. Capital Gains tax is
            implemented as a somewhat simplified version of the real thing in UK
            as at October 2022. Whilst FinKitty accounts for tax relief on
            pension contributions it does not cover any tax penalties incurred
            for breaching the Annual Pension Allowance. For most people, this
            allowance is £40,000pa, but it is reduced for high earners: always
            seek independent financial advice. Assuming ongoing development,
            future versions of the app will calculate incomes and gains to be
            taxed according to the rules applicable at the time the income or
            gain was made.
          </div>
          <div className="alert alert-block">
            <strong>Modeling assumptions</strong> In addition to the data you
            enter for modeling incomes, expenses, assets and transactions, you
            can provide a value for CPI to influence how values change over
            time. Future tax regime is assumed to be the latest known one. Any
            irregular losses such as stock market crashes or unexpected gains
            and windfalls can be input as part of a model but unless they are
            added, the future is assumed to progress smoothly (and
            unrealistically) in a predictable and continuous fashion.
          </div>
          <div className="alert alert-block">
            <strong>Small print!</strong> This web app should not be used to
            make important financial decisions without also getting independent
            advice from a qualified&nbsp;
            <a href="https://www.fca.org.uk/consumers/finding-adviser">
              &nbsp;independent financial advisor{' '}
            </a>{' '}
            to validate financial plans.
          </div>
        </div>
        <div className="col-md mb-4">{screenshotsDiv()}</div>
      </div>
    </>
  );
}
