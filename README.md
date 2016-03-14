Web browser keys to test functionality
Return = x
Tools/Guide? = k

former name: sstv-kino.pub
current name: kino-pub-4-smart-tv
# kino-pub-4-smart-tv
Kino.pub plugin for SmartTV

#package
cd ~/Projects/SmartTV/Apps/sstv-kino.pub;  zip -r -0 /var/www/0-default-site/widgets/kino_pub2.zip . -x *.git* -x *.idea* -x *.DS_Store -x build/* -x '$MANAGER_WIDGET/*'

#listing of widgetlist.xml
    <?xml version="1.0" encoding="UTF-8"?>
    <rsp stat="ok">
    <list>
       <widget id="ex_ua">
           <title>EX.UA</title>
           <compression size="1656763" type="zip"/>
           <description></description>
           <download>http://192.168.1.134/widgets/ex_ua.zip</download>
       </widget>
       <widget id="fs_to">
           <title>FS.to</title>
           <compression size="517608" type="zip"/>
           <description></description>
           <download>http://192.168.1.134/widgets/fs_to.zip</download>
       </widget>
         <widget id="kino_pub">
           <title>Kino.puv</title>
           <compression size="1656763" type="zip"/>
           <description></description>
           <download>http://192.168.1.134/widgets/kino_pub.zip</download>
       </widget>
    </list>
    </rsp>

#to do
* make scene of dynamic height. So it will fit all height between header and footer