import React from 'react';
import { screenshotsDiv } from './screenshotsPage';

export function loginPage(loginWithRedirect: any, loginForTesting: any) {
  return (
    <>
      <div className="page-header">
        <h1>
          Finkitty <small>an app for financial kitty forecasting</small>
        </h1>
      </div>
      <div className="row">
        <div className="col-sm mb-4">
          <div className="alert alert-block">
            <h2>Get started</h2> To begin using this app, click below
            <br />
            <button onClick={loginWithRedirect} id="buttonLogin">
              Login or create an account
            </button>
            <button onClick={loginForTesting} id="buttonTestLogin">
              Shared playpen (no login)
            </button>
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
            UK tax regulations as at December 2019. Capital Gains tax is
            implemented as a somewhat simplified version of the real thing in UK
            as at December 2019. Assuming ongoing development, future versions
            of the app will calculate incomes and gains to be taxed according to
            the rules applicable at the time the income or gain was made.
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